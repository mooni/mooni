import { Recipient } from '../types';
import { BityOrderResponse } from '../wrappers/bityTypes';
import { UUID } from '../../types/api';
import { CurrencySymbol } from './currencyTypes';

export enum TradeExact {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export enum TradeType {
  DEX = 'DEX',
  BITY = 'BITY',
}

export type TradePath = TradeType[];

export interface TradeRequest {
  inputCurrencySymbol: CurrencySymbol;
  outputCurrencySymbol: CurrencySymbol;
  amount: string;
  tradeExact: TradeExact;
}
export interface MultiTradeRequest {
  tradeRequest: TradeRequest,
  ethInfo: ETHInfo,
  bankInfo: BankInfo,
  referralId?: string,
}

export interface MultiTradeEstimation {
  tradeRequest: TradeRequest,
  trades: Trade[],
  path: TradePath;
  inputAmount: string,
  outputAmount: string,
  ethAmount: string,
}


export interface MultiTrade extends MultiTradeTemp{
  id: UUID,
}

export interface MultiTradeTemp extends MultiTradeEstimation{
  ethInfo: ETHInfo,
  bankInfo: BankInfo,
  referralId?: string,
}

export interface Trade {
  tradeRequest: TradeRequest,
  tradeType: TradeType,
  inputAmount: string,
  outputAmount: string,
  fee?: Fee,
}

export interface DexTrade extends Trade {
  dexMetadata: any;
  maxSlippage: number;
}
export interface BityTrade extends Trade {
  bityOrderResponse: BityOrderResponse,
}

export interface BankInfo {
  recipient: Recipient;
  reference?: string;
}

export interface ETHInfo {
  fromAddress: string,
}

export interface Fee {
  amount: string,
  currencySymbol: CurrencySymbol,
}
