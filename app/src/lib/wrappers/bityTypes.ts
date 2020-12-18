
export enum BityOrderStatus {
  WAITING = 'WAITING',
  CANCELLED = 'CANCELLED',
  EXECUTED = 'EXECUTED',
  RECEIVED = 'RECEIVED',
}

export type BityOrderResponse = {
  input: {
    amount: string,
    minimum_amount?: string,
    currency: string,
    type: string,
    crypto_address: string
  },
  output: {
    amount: string,
    minimum_amount?: string,
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
  },
  orderStatus?: BityOrderStatus;
};

export type BityOrderErrors = any[];

export class BityOrderError extends Error {
  errors: BityOrderErrors;
  _bityError: boolean;
  constructor(message: string, errors: BityOrderErrors = []) {
    super(message);
    this._bityError = true;
    this.errors = errors;
  }
}
