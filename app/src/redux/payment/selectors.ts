import { STATE_NAME } from './reducer';
import { RootState } from '../reducers';

export const getMultiTradeRequest = (state: RootState) => state[STATE_NAME].multiTradeRequest;
export const getRecipient = (state: RootState) => state[STATE_NAME].multiTradeRequest?.bankInfo?.recipient;
export const getReference = (state: RootState) => state[STATE_NAME].multiTradeRequest?.bankInfo?.reference;

export const getExchangeStep = (state: RootState) => state[STATE_NAME].exchangeStep;

export const getMultiTrade = (state: RootState) => state[STATE_NAME].multiTrade;
export const getOrderErrors = (state: RootState) => state[STATE_NAME].orderErrors;
export const getPayment = (state: RootState) => state[STATE_NAME].payment;

