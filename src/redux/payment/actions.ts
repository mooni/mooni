import {getOrder, getOrderRequest} from './selectors';
import {getAddress, getETHManager} from '../eth/selectors';
import {checkTradeAllowance, createOrder as libCreateOrder, executeTrade} from '../../lib/exchange';
import {ExchangePath, Payment, PaymentStatus, PaymentStepId, PaymentStepStatus} from '../../lib/types';
import {sendEvent} from '../../lib/analytics';
import Bity from '../../lib/bity';
import { track } from '../../lib/analytics';
import { log, logError } from '../../lib/log';
import { detectWalletError } from '../../lib/eth';

export const SET_RATE_REQUEST = 'SET_RATE_REQUEST';

export const SET_EXCHANGE_STEP = 'SET_EXCHANGE_STEP';

export const SET_RECIPIENT = 'SET_RECIPIENT';
export const SET_REFERENCE = 'SET_REFERENCE';

export const SET_ORDER = 'SET_ORDER';
export const SET_ORDER_ERRORS = 'SET_ORDER_ERRORS';
export const RESET_ORDER = 'RESET_ORDER';

export const RESET_PAYMENT = 'RESET_PAYMENT';
export const SET_PAYMENT = 'SET_PAYMENT';
export const UPDATE_PAYMENT_STEP = 'UPDATE_PAYMENT_STEP';
export const SET_PAYMENT_STATUS = 'SET_PAYMENT_STATUS';

export const setRateRequest = (rateRequest) => ({
  type: SET_RATE_REQUEST,
  payload: {
    rateRequest,
  }
});

export const setExchangeStep = (stepId) => ({
  type: SET_EXCHANGE_STEP,
  payload: {
    stepId,
  }
});

export const setRecipient = (recipient) => ({
  type: SET_RECIPIENT,
  payload: {
    recipient,
  }
});
export const setReference = (reference) => ({
  type: SET_REFERENCE,
  payload: {
    reference,
  }
});

export const setOrder = (order) => ({
  type: SET_ORDER,
  payload: {
    order,
  }
});
export const setOrderErrors = (errors) => ({
  type: SET_ORDER_ERRORS,
  payload: {
    orderErrors: errors,
  }
});

export const resetOrder = () => ({
  type: RESET_ORDER,
});

export const resetPayment = () => ({
  type: RESET_PAYMENT,
});

export const setPayment = (payment: Payment) => ({
  type: SET_PAYMENT,
  payload: { payment },
});

export const updatePaymentStep = (paymentStepUpdate: any) => ({
  type: UPDATE_PAYMENT_STEP,
  payload: { paymentStepUpdate },
});

export const setPaymentStatus = (status: PaymentStatus) => ({
  type: SET_PAYMENT_STATUS,
  payload: { status },
});

export const createPayment = (order) => (dispatch) => {
  const payment: Payment = {
    steps: [],
    status: PaymentStatus.ONGOING,
  };

  if(order.path === ExchangePath.DEX_BITY) {
    payment.steps.push({
      id: PaymentStepId.ALLOWANCE,
      status: PaymentStepStatus.QUEUED,
    });
    payment.steps.push({
      id: PaymentStepId.TRADE,
      status: PaymentStepStatus.QUEUED,
    });
  }

  payment.steps.push({
    id: PaymentStepId.PAYMENT,
    status: PaymentStepStatus.QUEUED,
  });
  payment.steps.push({
    id: PaymentStepId.BITY,
    status: PaymentStepStatus.QUEUED,
    bityOrderId: order.bityOrder.id,
  });

  dispatch(setPayment(payment));
};

export const createOrder = () => async function (dispatch, getState)  {
  dispatch(resetOrder());

  sendEvent('order', 'create', 'init');

  const state = getState();
  const fromAddress = getAddress(state);
  const orderRequest = getOrderRequest(state);

  try {

    const order = await libCreateOrder({
      recipient: orderRequest.recipient,
      rateRequest: orderRequest.rateRequest,
      reference: orderRequest.reference,
    }, fromAddress);

    dispatch(setOrder(order));
    dispatch(createPayment(order));

    sendEvent('order', 'create', 'done');

  } catch(error) {
    dispatch(setOrder(null));

    sendEvent('order', 'create', 'error');

    if(error._orderError) {
      logError('Bity order creation error', error);
      dispatch(setOrderErrors(error.errors));
    } else {
      logError('Bity order creation unknown error', error);
      dispatch(setOrderErrors([{code: 'unknown', message: 'unknown error'}]));
    }
  }
};

async function sendPaymentStep({ dispatch, stepId, paymentFunction, ethManager }) {
  dispatch(updatePaymentStep({
    id: stepId,
    status: PaymentStepStatus.APPROVAL,
  }));

  try {
    const txHash = await paymentFunction();

    if(txHash) {
      dispatch(updatePaymentStep({
        id: stepId,
        status: PaymentStepStatus.MINING,
        txHash,
      }));
      await ethManager.waitForConfirmedTransaction(txHash);
    }

    dispatch(updatePaymentStep({
      id: stepId,
      status: PaymentStepStatus.DONE,
    }));
  } catch(error) {

    let capturedError = detectWalletError(error) || error;
    dispatch(updatePaymentStep({
      id: stepId,
      status: PaymentStepStatus.ERROR,
      error: capturedError,
    }));
    throw capturedError;

  }
}

function watchBityOrder(dispatch, orderId) {
  const POLL_INTERVAL = 5000;
  let intervalId;

  dispatch(updatePaymentStep({
    id: PaymentStepId.BITY,
    status: PaymentStepStatus.MINING,
  }));

  function fetchNewData() {
    Bity.getOrderDetails(orderId)
      .then(orderDetails => {

        if(orderDetails.orderStatus === 'executed') {

          clearInterval(intervalId);
          dispatch(updatePaymentStep({
            id: PaymentStepId.BITY,
            status: PaymentStepStatus.DONE,
          }));
          dispatch(setPaymentStatus(PaymentStatus.DONE));
          sendEvent('payment', 'send', 'done');
          log('PAYMENT: bity ok');
          track('PAYMENT: bity ok');

        } else if(orderDetails.orderStatus === 'cancelled') {

          clearInterval(intervalId);
          dispatch(updatePaymentStep({
            id: PaymentStepId.BITY,
            status: PaymentStepStatus.ERROR,
            error: new Error('bity-order-cancelled'),
          }));
          dispatch(setPaymentStatus(PaymentStatus.ERROR));
          sendEvent('payment', 'send', 'error');
          log('PAYMENT: bity cancelled');
          track('PAYMENT: bity cancelled');

        }
      })
      .catch(error => logError('Error while fetching order state', error));
  }
  fetchNewData();
  intervalId = setInterval(fetchNewData, POLL_INTERVAL);
}

export const sendPayment = () => async function (dispatch, getState)  {

  sendEvent('payment', 'send', 'init');

  const state = getState();
  const order = getOrder(state);
  const ethManager = getETHManager(state);

  const bityInputAmount = order.bityOrder.input.amount;
  const bityDepositAddress = order.bityOrder.payment_details.crypto_address;
  log('PAYMENT: bity order id', order.bityOrder.id);

  try {
    if(order.path === ExchangePath.DEX_BITY) {

      if(!order.tradeData) throw new Error('missing trade data');
      const tradeDetails = order.tradeData.tradeDetails;

      // Allowance
      await sendPaymentStep({
        dispatch, ethManager,
        stepId: PaymentStepId.ALLOWANCE,
        paymentFunction: async () => checkTradeAllowance(tradeDetails, ethManager.signer).then(tx => tx?.hash)
      });
      log('PAYMENT: allowance ok');
      track('PAYMENT: allowance ok');

      // Trade
      await sendPaymentStep({
        dispatch, ethManager,
        stepId: PaymentStepId.TRADE,
        paymentFunction: async () => executeTrade(
          tradeDetails,
          undefined,
          ethManager.signer,
        ).then(tx => tx.hash)
      });
      log('PAYMENT: trade ok');
      track('PAYMENT: trade ok');

    }

    // Payment
    await sendPaymentStep({
      dispatch, ethManager,
      stepId: PaymentStepId.PAYMENT,
      paymentFunction: async () => ethManager.send(bityDepositAddress, bityInputAmount).then(tx => tx.hash)
    });
    log('PAYMENT: payment ok');
    track('PAYMENT: payment ok');

    watchBityOrder(dispatch, order.bityOrder.id);

  } catch(error) {

    logError('Error while sending payment', error);
    sendEvent('payment', 'send', 'error');
    dispatch(setPaymentStatus(PaymentStatus.ERROR));

  }
};
