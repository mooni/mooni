import { BN } from '../numbers';

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
  amount: string;
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
  inputAmount: string,
  outputAmount: string,
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
  currency: Currency,
}
