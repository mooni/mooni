import Bity from '../../lib/bity';
import { getRecipient, getPaymentDetail, getOrder, getContactPerson } from '../payment/selectors';
import { getAddress, getETHManager } from '../eth/selectors';

export const SET_INPUT_CURRENCY = 'SET_INPUT_CURRENCY';
export const SET_PAYMENT_DETAIL = 'SET_PAYMENT_DETAIL';
export const SET_RECIPIENT = 'SET_RECIPIENT';
export const SET_CONTACT_PERSON = 'SET_CONTACT_PERSON';
export const SET_ORDER = 'SET_ORDER';
export const SET_ORDER_ERRORS = 'SET_ORDER_ERRORS';
export const RESET_ORDER = 'RESET_ORDER';
export const SET_PAYMENT_STATUS = 'SET_PAYMENT_STATUS';

export const setInputCurrency = (inputCurrency) => ({
  type: SET_INPUT_CURRENCY,
  payload: {
    inputCurrency,
  }
});

export const setPaymentDetail = (paymentDetail) => ({
  type: SET_PAYMENT_DETAIL,
  payload: {
    paymentDetail,
  }
});

export const setRecipient = (recipient) => ({
  type: SET_RECIPIENT,
  payload: {
    recipient,
  }
});
export const setContactPerson = (contactPerson) => ({
  type: SET_CONTACT_PERSON,
  payload: {
    contactPerson,
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

export const setPaymentStatus = (paymentStatus) => ({
  type: SET_PAYMENT_STATUS,
  payload: {
    paymentStatus,
  }
});

export const createOrder = () => async function (dispatch, getState)  {
  const state = getState();
  const fromAddress = getAddress(state);
  const recipient = getRecipient(state);
  const paymentDetail = getPaymentDetail(state);
  const contactPerson = getContactPerson(state);

  try {
    const orderDetail = await Bity.order({
      fromAddress,
      recipient,
      paymentDetail,
      contactPerson,
    });

    if(!orderDetail.input) {
      const cookieError = new Error('api_error');
      cookieError.errors = [{code: 'cookie', message: 'your browser does not support cookies'}];
      throw cookieError;
    }
    dispatch(setOrder(orderDetail));
    dispatch(setOrderErrors(null));

    // TODO register delete order after price guaranteed timeout
  } catch(error) {
    dispatch(setOrder(null));

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
  const order = getOrder(state);
  const ethManager = getETHManager(getState());

  const { input: { amount }, payment_details: { crypto_address } } = order;

  dispatch(setPaymentStatus('approval'));
  try {
    console.log('send', ethManager.send);
    console.log('provider', ethManager.provider);
    const tx = await ethManager.send(crypto_address, amount);
    console.log('send', ethManager.send);
    console.log('provider', ethManager.provider);
    dispatch(setPaymentStatus('pending'));
    await ethManager.provider.waitForTransaction(tx.hash);
    dispatch(setPaymentStatus('mined'));
  } catch(error) {
    console.error(error);
    dispatch(setPaymentStatus('error'));
  }
};
