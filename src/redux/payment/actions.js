import Bity from '../../lib/bity';
import { getPaymentRequest, getPaymentOrder } from '../payment/selectors';
import { getAddress, getETHManager } from '../eth/selectors';
import { rateTokenForExactETH } from '../../lib/exchange';

export const SET_AMOUNT_DETAIL = 'SET_AMOUNT_DETAIL';
export const SET_RECIPIENT = 'SET_RECIPIENT';
export const SET_CONTACT_PERSON = 'SET_CONTACT_PERSON';
export const SET_REFERENCE = 'SET_REFERENCE';
export const SET_PAYMENT_ORDER = 'SET_PAYMENT_ORDER';
export const SET_ORDER_ERRORS = 'SET_ORDER_ERRORS';
export const SET_TOKEN_EXCHANGE = 'SET_TOKEN_EXCHANGE';
export const RESET_ORDER = 'RESET_ORDER';
export const SET_PAYMENT_STATUS = 'SET_PAYMENT_STATUS';

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

export const createOrder = () => async function (dispatch, getState)  {
  const state = getState();
  const fromAddress = getAddress(state);
  const paymentRequest = getPaymentRequest(state);

  if(paymentRequest.amountDetail.tradeExact === 'INPUT') throw new Error('not implemented');

  try {
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

    if(!orderDetail.input) {
      const cookieError = new Error('api_error');
      cookieError.errors = [{code: 'cookie', message: 'your browser does not support cookies'}];
      throw cookieError;
    }

    const paymentOrder = {
      path: 'BITY',
      bityOrder: orderDetail,
    };

    if(paymentRequest.amountDetail.inputCurrency !== 'ETH') {
      paymentOrder.path = 'DEX_BITY';
      paymentOrder.tokenRate = await rateTokenForExactETH(paymentRequest.amountDetail.inputCurrency, orderDetail.input.amount);
    }

    dispatch(setPaymentOrder(paymentOrder));

    // TODO register delete order after price guaranteed timeout
  } catch(error) {
    dispatch(setPaymentOrder(null));

    if(error.message === 'api_error') {
      dispatch(setOrderErrors(error.errors));
    } else {
      console.error(error);
      dispatch(setOrderErrors([{code: 'unknown', message: 'unknown error'}]));
    }
  }
};

export const sendPayment = () => async function (dispatch, getState)  {
  const state = getState();
  const { bityOrder } = getPaymentOrder(state);
  const ethManager = getETHManager(getState());

  const { input: { amount }, payment_details: { crypto_address } } = bityOrder;

  dispatch(setPaymentStatus('approval'));
  try {
    const tx = await ethManager.send(crypto_address, amount);
    dispatch(setPaymentStatus('pending'));
    await ethManager.provider.waitForTransaction(tx.hash);
    dispatch(setPaymentStatus('mined'));
  } catch(error) {
    console.error(error);
    dispatch(setPaymentStatus('error'));
  }
};
