import Bity from '../../lib/bity';
import { getPaymentRequest, getPaymentOrder } from '../payment/selectors';
import { getAddress, getETHManager } from '../eth/selectors';
import { rateTokenForExactETH, executeTrade, checkTradeAllowance, getExchangeAddress } from '../../lib/exchange';

import { sendEvent } from '../../lib/analytics';

export const SET_AMOUNT_DETAIL = 'SET_AMOUNT_DETAIL';
export const SET_RECIPIENT = 'SET_RECIPIENT';
export const SET_CONTACT_PERSON = 'SET_CONTACT_PERSON';
export const SET_REFERENCE = 'SET_REFERENCE';
export const SET_PAYMENT_ORDER = 'SET_PAYMENT_ORDER';
export const SET_ORDER_ERRORS = 'SET_ORDER_ERRORS';
export const RESET_ORDER = 'RESET_ORDER';
export const SET_PAYMENT_STATUS = 'SET_PAYMENT_STATUS';
export const SET_PAYMENT_TRANSACTION = 'SET_PAYMENT_TRANSACTION';
export const SET_PAYMENT_STEP = 'SET_PAYMENT_STEP';

export const setAmountDetail = (amountDetail) => ({
  type: SET_AMOUNT_DETAIL,
  payload: {
    amountDetail,
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
  const walletAddress = getAddress(state);
  const paymentRequest = getPaymentRequest(state);

  if(paymentRequest.amountDetail.tradeExact !== 'OUTPUT') throw new Error('not implemented');

  try {
    let fromAddress = walletAddress;

    if(paymentRequest.amountDetail.inputCurrency !== 'ETH') {
      fromAddress = await getExchangeAddress(paymentRequest.amountDetail.inputCurrency);
    }

    const orderDetail = await Bity.order({
      fromAddress,
      recipient: paymentRequest.recipient,
      paymentDetail: {
        inputCurrency: 'ETH',
        outputAmount: paymentRequest.amountDetail.amount,
        outputCurrency: paymentRequest.amountDetail.outputCurrency,
      },
      reference: paymentRequest.reference,
      contactPerson: paymentRequest.contactPerson,
    });

    const paymentOrder = {
      paymentRequest,
      path: 'BITY',
      bityOrder: orderDetail,
    };

    if(paymentRequest.amountDetail.inputCurrency !== 'ETH') {
      paymentOrder.path = 'DEX_BITY';
      paymentOrder.tokenRate = await rateTokenForExactETH(paymentRequest.amountDetail.inputCurrency, orderDetail.input.amount);
    }

    dispatch(setPaymentOrder(paymentOrder));
    sendEvent('order', 'create', 'done');

    // TODO register delete order after price guaranteed timeout
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
  const ethManager = getETHManager(getState());
  dispatch(setPaymentTransaction(null));

  if(paymentOrder.paymentRequest.amountDetail.tradeExact !== 'OUTPUT') throw new Error('not implemented');

  const bityInputAmount = paymentOrder.bityOrder.input.amount;
  const bityDepositAddress = paymentOrder.bityOrder.payment_details.crypto_address;

  try {
    if(paymentOrder.path === 'BITY') {

      dispatch(setPaymentStatus('approval'));
      const tx = await ethManager.send(bityDepositAddress, bityInputAmount);
      dispatch(setPaymentTransaction({ hash: tx.hash }));

      dispatch(setPaymentStatus('mining-payment'));
      await ethManager.waitForConfirmedTransaction(tx.hash);

    } else if(paymentOrder.path === 'DEX_BITY') {
      dispatch(setPaymentStatus('check-allowance'));
      const approveTx = await checkTradeAllowance(paymentOrder.tokenRate.tradeDetails, ethManager.signer);

      if(approveTx) {
        dispatch(setPaymentStatus('mining-allowance'));
        await ethManager.waitForConfirmedTransaction(approveTx.hash);
      }

      dispatch(setPaymentStatus('approval'));
      const executeTx = await executeTrade(
        paymentOrder.tokenRate.tradeDetails,
        bityDepositAddress,
        ethManager.signer,
      );
      dispatch(setPaymentTransaction({ hash: executeTx.hash }));

      dispatch(setPaymentStatus('mining-payment'));
      await ethManager.waitForConfirmedTransaction(executeTx.hash);

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
