export enum TradeExact { INPUT, OUTPUT }

export enum ExchangePath { BITY, DEX_BITY }

export interface RateRequest {
  inputCurrency: string;
  outputCurrency: string;
  amount: string;
  tradeExact: TradeExact;
}

export interface RateResult {
  inputCurrency: string;
  outputCurrency: string;
  inputAmount: string;
  outputAmount: string;
  tradeExact: TradeExact;
  fees?: {
    amount: string;
    currency: string;
  };
}

export interface DexTrade {
  inputCurrency: string;
  outputCurrency: string;
  inputAmount: string;
  outputAmount: string;
  tradeExact: TradeExact;
  rate: string;
  invertedRate: string;
  tradeDetails: any;
}

export interface Recipient {
  owner: {
    name: string;
    country?: string;
    address?: string;
    zip?: string;
    city?: string;
  }
  iban: string;
  bic_swift?: string;
  email?: string;
}

export type OrderErrors = any[];

export class OrderError extends Error {
  errors: OrderErrors;
  _orderError: boolean;
  constructor(message: string, errors: OrderErrors = []) {
    super(message);
    this._orderError = true;
    this.errors = errors;
  }
}

export interface OrderRequest {
  recipient: Recipient;
  rateRequest: RateRequest;
  reference?: string;
}

export type BityOrderResponse = {
  input: {
    amount: string,
    currency: string,
    type: string,
    crypto_address: string
  },
  output: {
    amount: string,
    currency: string,
    type: string,
    iban: string,
    reference: string
  },
  id: string,
  timestamp_created: string,
  timestamp_awaiting_payment_since: string,
  timestamp_price_guaranteed: string,
  payment_details: {
    crypto_address: string,
    type: string
  },
  price_breakdown: {
    customer_trading_fee: {
      amount: string,
      currency: string
    }
  },
  fees: {
    amount: string,
    currency: string
  }
};

export interface Order {
  orderRequest: OrderRequest;
  estimatedRates: {
    inputAmount: string;
    inputCurrency: string;
    outputAmount: string;
    outputCurrency: string;
  };
  bityOrder: BityOrderResponse;
  path: ExchangePath;
  tradeData?: {
    tradeDetails: any;
  };
}

export enum PaymentStepStatus { QUEUED, APPROVAL, MINING, DONE, ERROR }
export enum PaymentStatus { ONGOING, DONE, ERROR }
export enum PaymentStepId { ALLOWANCE, TRADE, PAYMENT, BITY }
export interface PaymentStep {
  id: PaymentStepId;
  status: PaymentStepStatus;
  txHash?: string;
  bityOrderId?: string;
}

export interface Payment {
  status: PaymentStatus;
  steps: PaymentStep[];
}


