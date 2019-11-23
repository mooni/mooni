import Bity from '../../lib/bity';
import { getRecipient, getPaymentDetail, getOrder } from '../payment/selectors';
import { getAddress, getConnect } from '../eth/selectors';

export const SET_INPUT_CURRENCY = 'SET_INPUT_CURRENCY';
export const SET_PAYMENT_DETAIL = 'SET_PAYMENT_DETAIL';
export const SET_RECIPIENT = 'SET_RECIPIENT';
export const SET_ORDER = 'SET_ORDER';

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

export const setOrder = (order) => ({
  type: SET_ORDER,
  payload: {
    order,
  }
});

export const createOrder = () => async function (dispatch, getState)  {
  const state = getState();
  const fromAddress = getAddress(state);
  const recipient = getRecipient(state);
  const paymentDetail = getPaymentDetail(state);

  const orderDetail = await Bity.order({
    fromAddress,
    recipient,
    paymentDetail,
  });

  dispatch(setOrder(orderDetail));

  // TODO register delete order after price guaranteed timeout
};

export const sendPayment = () => async function (dispatch, getState)  {
  const state = getState();
  const order = getOrder(state);
  const connect = getConnect(getState());

  const { input: { amount }, payment_details: { crypto_address } } = order;

  await connect.send(crypto_address, amount);
};
