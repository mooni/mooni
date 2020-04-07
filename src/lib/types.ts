export enum TradeExact { INPUT, OUTPUT }

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
