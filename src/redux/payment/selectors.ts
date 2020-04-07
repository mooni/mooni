import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';

import {RateRequest, Recipient, Order, OrderRequest, OrderErrors} from '../../lib/types';

export const getOrderRequest: (state: any) => OrderRequest = selectProperty([STATE_NAME, 'orderRequest']);
export const getRateRequest: (state: any) => RateRequest = selectProperty([STATE_NAME, 'orderRequest', 'rateRequest']);
export const getRecipient: (state: any) => Recipient  = selectProperty([STATE_NAME, 'orderRequest', 'recipient']);
export const getReference: (state: any) => string  = selectProperty([STATE_NAME, 'orderRequest', 'reference']);

export const getExchangeStep: (state: any) => number = selectProperty([STATE_NAME, 'exchangeStep']);

export const getOrder: (state: any) => Order = selectProperty([STATE_NAME, 'order']);
export const getOrderErrors: (state: any) => OrderErrors = selectProperty([STATE_NAME, 'orderErrors']);
export const getPaymentStatus: (state: any) => string = selectProperty([STATE_NAME, 'paymentStatus']);
export const getPaymentTransaction: (state: any) => any = selectProperty([STATE_NAME, 'paymentTransaction']);

