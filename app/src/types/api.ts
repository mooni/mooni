import { CurrencySymbol } from '../lib/trading/currencyTypes';

export type UUID = string;
export type CUID = string;
export type EthereumAddress = string;
export type CurrencyAmount = string;
export type TransactionHash = string;

export enum MooniOrderStatus {
  PENDING = 'PENDING',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: UUID;
  createdAt: Date;
  ethAddress: EthereumAddress;
  referralId: CUID;
}

export interface MooniOrder {
  id: UUID;
  createdAt: Date;
  executedAt?: Date;
  status: MooniOrderStatus;
  ethAddress: EthereumAddress;
  txHash: TransactionHash;
  inputAmount: CurrencyAmount;
  inputCurrency: CurrencySymbol;
  outputAmount: CurrencyAmount;
  outputCurrency: CurrencySymbol;
  ethAmount: CurrencyAmount;
  bityOrderId?: UUID;
  referralId?: CUID;
}

export interface Stats {
  ordersCount: string;
  totalETH: string;
  totalEUR: string;
  totalCHF: string;
}
export interface ProfitShare {
  referralTxCount: number;
  referralProfit: string;
}
