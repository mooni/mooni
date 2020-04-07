import {getOrder, getOrderRequest} from './selectors';
import {getAddress, getETHManager} from '../eth/selectors';
import {createOrder as libCreateOrder} from '../../lib/exchange';
import {ExchangePath, Order, OrderRequest} from '../../lib/types';
import {sendEvent} from '../../lib/analytics';
// import {
//   rateTokenToETH,
//   executeTrade,
//   checkTradeAllowance,
// } from '../../lib/exchange';

export const SET_RATE_REQUEST = 'SET_RATE_REQUEST';
export const SET_RECIPIENT = 'SET_RECIPIENT';
export const SET_REFERENCE = 'SET_REFERENCE';
export const SET_ORDER = 'SET_ORDER';
export const SET_ORDER_ERRORS = 'SET_ORDER_ERRORS';
export const RESET_ORDER = 'RESET_ORDER';
export const SET_PAYMENT_STATUS = 'SET_PAYMENT_STATUS';
export const SET_PAYMENT_TRANSACTION = 'SET_PAYMENT_TRANSACTION';
export const SET_PAYMENT_STEP = 'SET_PAYMENT_STEP';

export const setRateRequest = (rateRequest) => ({
  type: SET_RATE_REQUEST,
  payload: {
    rateRequest,
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

export const setExchangeStep = (stepId) => ({
  type: SET_PAYMENT_STEP,
  payload: {
    stepId,
  }
});


export const setPaymentStatus = (paymentStatus) => ({
  type: SET_PAYMENT_STATUS,
  payload: {
    paymentStatus,
  }
});
export const setPaymentTransaction = (paymentTransaction) => ({
  type: SET_PAYMENT_TRANSACTION,
  payload: {
    paymentTransaction,
  }
});

export const createOrder = () => async function (dispatch, getState)  {
  dispatch(resetOrder());

  sendEvent('order', 'create', 'init');

  const state = getState();
  const fromAddress = getAddress(state);
  const orderRequest: OrderRequest = getOrderRequest(state);

  if(orderRequest.rateRequest.inputCurrency !== 'ETH')
    throw new Error('order from other that ETH not implemented');

  try {

    const order = await libCreateOrder({
      recipient: orderRequest.recipient,
      rateRequest: orderRequest.rateRequest,
      reference: orderRequest.reference,
    }, fromAddress);

    dispatch(setOrder(order));
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
  const order: Order = getOrder(state);
  const ethManager = getETHManager(state);
  dispatch(setPaymentTransaction(null));

  const bityInputAmount = order.bityOrder.input.amount;
  const bityDepositAddress = order.bityOrder.payment_details.crypto_address;

  try {
    if(order.path === ExchangePath.BITY) {

      dispatch(setPaymentStatus('approval'));

      const tx = await ethManager.send(bityDepositAddress, bityInputAmount);

      dispatch(setPaymentTransaction({ hash: tx.hash }));
      dispatch(setPaymentStatus('mining-payment'));

      await ethManager.waitForConfirmedTransaction(tx.hash);

    // TODO ERC20
    // } else
    // if(paymentOrder.path === 'DEX_BITY') {
    //
    //   dispatch(setPaymentStatus('check-allowance'));
    //   const approveTx = await checkTradeAllowance(paymentOrder.tokenRate.tradeDetails, ethManager.signer);
    //
    //   if(approveTx) {
    //     dispatch(setPaymentStatus('mining-allowance'));
    //     await ethManager.waitForConfirmedTransaction(approveTx.hash);
    //   }
    //
    //   dispatch(setPaymentStatus('approval'));
    //   const executeTx = await executeTrade(
    //     paymentOrder.tokenRate.tradeDetails,
    //     bityDepositAddress,
    //     ethManager.signer,
    //   );
    //   dispatch(setPaymentTransaction({ hash: executeTx.hash }));
    //
    //   dispatch(setPaymentStatus('mining-payment'));
    //   await ethManager.waitForConfirmedTransaction(executeTx.hash);

    } else {
      throw new Error('invalid payment path');
    }

    dispatch(setPaymentStatus('mined'));

    sendEvent('payment', 'send', 'done');

  } catch(error) {
    console.error(error);
    sendEvent('payment', 'send', 'error');
    dispatch(setPaymentStatus('error'));
  }
};
