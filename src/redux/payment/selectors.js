import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';

export const getPaymentRequest = selectProperty([STATE_NAME, 'paymentRequest']);
export const getRateRequest = selectProperty([STATE_NAME, 'paymentRequest', 'rateRequest']);
export const getRecipient = selectProperty([STATE_NAME, 'paymentRequest', 'recipient']);
export const getContactPerson = selectProperty([STATE_NAME, 'paymentRequest', 'contactPerson']);
export const getReference = selectProperty([STATE_NAME, 'paymentRequest', 'reference']);

export const getExchangeStep = selectProperty([STATE_NAME, 'exchangeStep']);

export const getPaymentOrder = selectProperty([STATE_NAME, 'paymentOrder']);
export const getOrderErrors = selectProperty([STATE_NAME, 'orderErrors']);
export const getPaymentStatus = selectProperty([STATE_NAME, 'paymentStatus']);
export const getPaymentTransaction = selectProperty([STATE_NAME, 'paymentTransaction']);

