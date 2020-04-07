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
  fees: object;
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

export class OrderError extends Error {
  errors: any[];
  _orderError: boolean;
  constructor(message, errors: any[] = []) {
    super(message);
    this._orderError = true;
    this.errors = errors;
  }
}


export interface BityOrderRequest {
  fromAddress: string;
  recipient: Recipient;
  rateRequest: RateRequest;
  reference?: string;
}

export interface OrderRequest {
  fromAddress: string;
  recipient: Recipient;
  rateRequest: RateRequest;
  reference?: string;
}
export type BityOrderResponse = any;

export interface Order {
  orderRequest: OrderRequest;
  bityOrder: BityOrderResponse;
  path: ExchangePath;
}

