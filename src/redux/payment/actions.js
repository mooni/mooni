import Bity from '../../lib/bity';
import { getRecipient, getPaymentDetail, getOrder, getContactPerson } from '../payment/selectors';
import { getAddress, getConnect } from '../eth/selectors';

export const SET_INPUT_CURRENCY = 'SET_INPUT_CURRENCY';
export const SET_PAYMENT_DETAIL = 'SET_PAYMENT_DETAIL';
export const SET_RECIPIENT = 'SET_RECIPIENT';
export const SET_CONTACT_PERSON = 'SET_CONTACT_PERSON';
export const SET_ORDER = 'SET_ORDER';
export const SET_ORDER_ERROR = 'SET_ORDER_ERROR';
export const RESET_ORDER = 'RESET_ORDER';

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
export const setOrderError = (error) => ({
  type: SET_ORDER_ERROR,
  payload: {
    orderError: error,
  }
});

export const resetOrder = () => ({
  type: RESET_ORDER,
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

    dispatch(setOrder(orderDetail));
    dispatch(setOrderError(null));

    // TODO register delete order after price guaranteed timeout
  } catch(error) {
    dispatch(setOrder(null));
    dispatch(setOrderError(error));
  }

};

export const sendPayment = () => async function (dispatch, getState)  {
  const state = getState();
  const order = getOrder(state);
  const connect = getConnect(getState());

  const { input: { amount }, payment_details: { crypto_address } } = order;

  await connect.send(crypto_address, amount);
};
