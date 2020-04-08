import { selectProperty } from '../helpers';
import { STATE_NAME, State } from './reducer';

import {RateRequest, Recipient, Order, OrderRequest, OrderErrors} from '../../lib/types';

export const getOrderRequest: (state: State) => OrderRequest = selectProperty([STATE_NAME, 'orderRequest']);
export const getRateRequest: (state: State) => RateRequest = selectProperty([STATE_NAME, 'orderRequest', 'rateRequest']);
export const getRecipient: (state: State) => Recipient  = selectProperty([STATE_NAME, 'orderRequest', 'recipient']);
export const getReference: (state: State) => string  = selectProperty([STATE_NAME, 'orderRequest', 'reference']);

export const getExchangeStep: (state: State) => number = selectProperty([STATE_NAME, 'exchangeStep']);

export const getOrder: (state: State) => Order = selectProperty([STATE_NAME, 'order']);
export const getOrderErrors: (state: State) => OrderErrors = selectProperty([STATE_NAME, 'orderErrors']);
export const getPaymentStatus: (state: State) => string = selectProperty([STATE_NAME, 'paymentStatus']);
export const getPaymentTransaction: (state: State) => any = selectProperty([STATE_NAME, 'paymentTransaction']);

