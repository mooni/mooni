import { JSBI } from '../numbers';

import { Recipient } from "../types";
import { BityOrderResponse } from "./bity";
import { Currency } from "./currencies";

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
  inputCurrency: Currency;
  outputCurrency: Currency;
  amount: JSBI;
  tradeExact: TradeExact;
}
export interface MultiTradeRequest {
  tradeRequest: TradeRequest,
  ethInfo?: ETHInfo,
  bankInfo?: BankInfo,
}

export interface DexTradeRequest extends TradeRequest {}
export interface BityTradeRequest extends TradeRequest {}

export interface MultiTrade {
  multiTradeRequest: MultiTradeRequest,
  trades: Trade[],
  path: TradePath;
  inputAmount: JSBI,
  outputAmount: JSBI,
}

export interface Trade {
  tradeRequest: TradeRequest,
  inputAmount: JSBI,
  outputAmount: JSBI,
  fee?: Fee,
}

export interface DexTrade extends Trade {
  dexMetadata: any;
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
  amount: JSBI,
  currency: Currency,
}
