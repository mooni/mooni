import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';

export const getInputCurrency = selectProperty([STATE_NAME, 'inputCurrency']);
export const getPaymentDetail = selectProperty([STATE_NAME, 'paymentDetail']);
export const getRecipient = selectProperty([STATE_NAME, 'recipient']);
export const getContactPerson = selectProperty([STATE_NAME, 'contactPerson']);
export const getOrder = selectProperty([STATE_NAME, 'order']);
export const getOrderErrors = selectProperty([STATE_NAME, 'orderErrors']);
export const getPaymentStatus = selectProperty([STATE_NAME, 'paymentStatus']);
