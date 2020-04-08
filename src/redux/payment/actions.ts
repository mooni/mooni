import {getOrder, getOrderRequest} from './selectors';
import {getAddress, getETHManager} from '../eth/selectors';
import {checkTradeAllowance, createOrder as libCreateOrder, executeTrade} from '../../lib/exchange';
import {ExchangePath, Payment, PaymentStatus, PaymentStepId, PaymentStepStatus} from '../../lib/types';
import {sendEvent} from '../../lib/analytics';

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
      dispatch(setOrderErrors(error.errors));
    } else {
      console.error(error);
      dispatch(setOrderErrors([{code: 'unknown', message: 'unknown error'}]));
    }
  }
};

export const sendPayment = () => async function (dispatch, getState)  {

  sendEvent('payment', 'send', 'init');

  const state = getState();
  const order = getOrder(state);
  const ethManager = getETHManager(state);

  const bityInputAmount = order.bityOrder.input.amount;
  const bityDepositAddress = order.bityOrder.payment_details.crypto_address;

  try {
    if(order.path === ExchangePath.DEX_BITY) {

      if(!order.tradeData) throw new Error('missing trade data');

      // Allowance

      dispatch(updatePaymentStep({
        id: PaymentStepId.ALLOWANCE,
        status: PaymentStepStatus.APPROVAL,
      }));

      const approveTx = await checkTradeAllowance(order.tradeData.tradeDetails, ethManager.signer);
      if(approveTx) {
        dispatch(updatePaymentStep({
          id: PaymentStepId.ALLOWANCE,
          status: PaymentStepStatus.MINING,
          txHash: approveTx.hash,
        }));
        await ethManager.waitForConfirmedTransaction(approveTx.hash);
      }
      dispatch(updatePaymentStep({
        id: PaymentStepId.ALLOWANCE,
        status: PaymentStepStatus.DONE,
      }));

      // Trade

      dispatch(updatePaymentStep({
        id: PaymentStepId.TRADE,
        status: PaymentStepStatus.APPROVAL,
      }));

      const tradeTx = await executeTrade(
        order.tradeData.tradeDetails,
        undefined,
        ethManager.signer,
      );
      dispatch(updatePaymentStep({
        id: PaymentStepId.TRADE,
        status: PaymentStepStatus.MINING,
        txHash: tradeTx.hash,
      }));

      await ethManager.waitForConfirmedTransaction(tradeTx.hash);
      dispatch(updatePaymentStep({
        id: PaymentStepId.TRADE,
        status: PaymentStepStatus.DONE,
      }));

    }

    // Payment

    dispatch(updatePaymentStep({
      id: PaymentStepId.PAYMENT,
      status: PaymentStepStatus.APPROVAL,
    }));

    const tx = await ethManager.send(bityDepositAddress, bityInputAmount);
    dispatch(updatePaymentStep({
      id: PaymentStepId.PAYMENT,
      status: PaymentStepStatus.MINING,
      txHash: tx.hash,
    }));

    await ethManager.waitForConfirmedTransaction(tx.hash);
    dispatch(updatePaymentStep({
      id: PaymentStepId.PAYMENT,
      status: PaymentStepStatus.DONE,
    }));


    dispatch(setPaymentStatus(PaymentStatus.DONE));

    sendEvent('payment', 'send', 'done');

  } catch(error) {
    console.error(error);
    sendEvent('payment', 'send', 'error');
    dispatch(setPaymentStatus(PaymentStatus.ERROR));
  }
};
