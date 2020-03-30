import Bity from '../../lib/bity';
import { getPaymentRequest, getPaymentOrder } from '../payment/selectors';
import { getAddress, getETHManager } from '../eth/selectors';
// import {
//   rateTokenToETH,
//   executeTrade,
//   checkTradeAllowance,
// } from '../../lib/exchange';

import { sendEvent } from '../../lib/analytics';

export const SET_RATE_REQUEST = 'SET_RATE_REQUEST';
export const SET_RECIPIENT = 'SET_RECIPIENT';
export const SET_CONTACT_PERSON = 'SET_CONTACT_PERSON';
export const SET_REFERENCE = 'SET_REFERENCE';
export const SET_PAYMENT_ORDER = 'SET_PAYMENT_ORDER';
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
export const setContactPerson = (contactPerson) => ({
  type: SET_CONTACT_PERSON,
  payload: {
    contactPerson,
  }
});

export const setPaymentOrder = (paymentOrder) => ({
  type: SET_PAYMENT_ORDER,
  payload: {
    paymentOrder,
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
export const setPaymentStep = (stepId) => ({
  type: SET_PAYMENT_STEP,
  payload: {
    stepId,
  }
});

export const createOrder = () => async function (dispatch, getState)  {
  dispatch(resetOrder());

  sendEvent('order', 'create', 'init');

  const state = getState();
  const fromAddress = getAddress(state);
  const paymentRequest = getPaymentRequest(state);

  if(paymentRequest.rateRequest.inputCurrency !== 'ETH')
    throw new Error('order from other that ETH not implemented');

  try {

    const orderDetail = await Bity.order({
      fromAddress,
      recipient: paymentRequest.recipient,
      rateRequest: paymentRequest.rateRequest,
      reference: paymentRequest.reference,
      contactPerson: paymentRequest.contactPerson,
    });

    const paymentOrder = {
      paymentRequest,
      path: 'BITY',
      bityOrder: orderDetail,
    };

    // TODO, if tradeExact === INPUT && inputCurrency !== ETH then resulting ETH amount may be different that what bity expects
    // if(paymentRequest.rateRequest.inputCurrency !== 'ETH') {
    //   paymentOrder.path = 'DEX_BITY';
    //   paymentOrder.tokenRate = await rateTokenToETH(paymentRequest.rateRequest.inputCurrency, orderDetail.input.amount, 'EXACT_ETH');
    // }

    dispatch(setPaymentOrder(paymentOrder));
    sendEvent('order', 'create', 'done');

  } catch(error) {
    dispatch(setPaymentOrder(null));

    sendEvent('order', 'create', 'error');

    if(error.message === 'api_error') {
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
  const paymentOrder = getPaymentOrder(state);
  const ethManager = getETHManager(state);
  dispatch(setPaymentTransaction(null));

  const bityInputAmount = paymentOrder.bityOrder.input.amount;
  const bityDepositAddress = paymentOrder.bityOrder.payment_details.crypto_address;

  try {
    if(paymentOrder.path === 'BITY') {

      dispatch(setPaymentStatus('approval'));

      const tx = await ethManager.send(bityDepositAddress, bityInputAmount);

      dispatch(setPaymentTransaction({ hash: tx.hash }));
      dispatch(setPaymentStatus('mining-payment'));

      await ethManager.waitForConfirmedTransaction(tx.hash);

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
