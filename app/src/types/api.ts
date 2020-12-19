import {CurrencySymbol} from "../lib/trading/types";

type UUID = string;
type CUID = string;
type EthereumAddress = string;
type CurrencyAmount = string;

enum MooniOrderStatus {
  PENDING = 'PENDING',
  EXECUTED = 'EXECUTED',
}

export interface User {
  id: UUID;
  createdAt: Date;
  ethAddress: EthereumAddress;
  referalId: CUID;
}

export interface MooniOrder {
  id: UUID;
  createdAt: Date;
  executedAt?: Date;
  status: MooniOrderStatus;
  ethAddress: EthereumAddress;
  inputAmount: CurrencyAmount;
  inputCurrency: CurrencySymbol;
  outputAmount: CurrencyAmount;
  outputCurrency: CurrencySymbol;
  ethAmount: CurrencyAmount;
  bityOrderId?: UUID;
  referalId?: CUID;
}
