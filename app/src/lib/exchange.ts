import {DexTrade, ExchangePath, Order, OrderRequest, RateRequest, RateResult, TradeExact} from './types';

export async function getRate(rateRequest: RateRequest): Promise<RateResult> {
  const rateResult: RateResult = {
    inputCurrency: rateRequest.inputCurrency,
    outputCurrency: rateRequest.outputCurrency,
    tradeExact: rateRequest.tradeExact,
    inputAmount: '1',
    outputAmount: '2',
  };
  return rateResult;
}

export async function createOrder(orderRequest: OrderRequest, fromAddress: string, jwsToken: string): Promise<Order> {
  return {
    orderRequest,
    estimatedRates: {
      inputAmount: '0',
      inputCurrency: orderRequest.rateRequest.inputCurrency,
      outputAmount: '0',
      outputCurrency: orderRequest.rateRequest.outputCurrency,
    },
    bityOrder: {
      input: {
        amount: '0.080414513629301225',
        currency: 'ETH',
        type: 'crypto_address',
        crypto_address: '0x90f227b0fbda2a4e788410afb758fa5bfe42be19'
      },
      output: {
        amount: '10',
        currency: 'EUR',
        type: 'bank_account',
        iban: 'NL91ABNA9326322815',
        reference: 'ceferfs'
      },
      id: '5daa7e15-e0ad-41c4-89aa-bc83bb346d73',
      timestamp_created: '2020-03-25T13:31:28.948Z',
      timestamp_awaiting_payment_since: '2020-03-25T13:31:31.831Z',
      timestamp_price_guaranteed: '2021-03-25T13:41:31.831Z',
      payment_details: {
        crypto_address: '0x90f227b0fbda2a4e788410afb758fa5bfe42be19',
        type: 'crypto_address'
      },
      price_breakdown: {
        customer_trading_fee: {
          amount: '0.000635986164121',
          currency: 'ETH'
        }
      },
      fees: {
        amount: '0.000635986164121',
        currency: 'ETH'
      }
    },
    path: ExchangePath.BITY,
  };

}
