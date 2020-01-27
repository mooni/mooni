import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';

export const getPaymentRequest = selectProperty([STATE_NAME, 'paymentRequest']);
export const getAmountDetail = selectProperty([STATE_NAME, 'paymentRequest', 'amountDetail']);
export const getRecipient = selectProperty([STATE_NAME, 'paymentRequest', 'recipient']);
export const getContactPerson = selectProperty([STATE_NAME, 'paymentRequest', 'contactPerson']);
export const getReference = selectProperty([STATE_NAME, 'paymentRequest', 'reference']);

export const getPaymentOrder = selectProperty([STATE_NAME, 'paymentOrder']);
export const getOrderErrors = selectProperty([STATE_NAME, 'orderErrors']);
export const getPaymentStatus = selectProperty([STATE_NAME, 'paymentStatus']);
