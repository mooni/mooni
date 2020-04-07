import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';

export const getOrderRequest = selectProperty([STATE_NAME, 'orderRequest']);
export const getRateRequest = selectProperty([STATE_NAME, 'orderRequest', 'rateRequest']);
export const getRecipient = selectProperty([STATE_NAME, 'orderRequest', 'recipient']);
export const getReference = selectProperty([STATE_NAME, 'orderRequest', 'reference']);

export const getExchangeStep = selectProperty([STATE_NAME, 'exchangeStep']);

export const getOrder = selectProperty([STATE_NAME, 'order']);
export const getOrderErrors = selectProperty([STATE_NAME, 'orderErrors']);
export const getPaymentStatus = selectProperty([STATE_NAME, 'paymentStatus']);
export const getPaymentTransaction = selectProperty([STATE_NAME, 'paymentTransaction']);

