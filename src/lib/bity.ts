import axios from 'axios';
import { TradeExact, RateRequest, OrderError, RateResult, BityOrderRequest, BityOrderResponse } from './types';

const API_URL = 'https://exchange.api.bity.com';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

function removeEmptyStrings(data = {}) {
  return Object.keys(data).reduce((acc, prop) => {
      if(data[prop] !== '' && data[prop] !== undefined) {
        return Object.assign(acc, { [prop]: data[prop] });
      }
      return acc;
    },
    {});
}

const Bity = {
  async getCurrencies(tags = []) {
    const params = {
      tags: tags.join(','),
    };

    const { data } = await instance({
      method: 'get',
      url: '/v2/currencies',
      params,
    });

    return data.currencies.map(currency => currency.code);
  },

  async estimate(rateRequest: RateRequest): Promise<RateResult> {
    const { inputCurrency, outputCurrency, amount, tradeExact } = rateRequest;

    const body: any = {
      input: {
        currency: inputCurrency,
      },
      output: {
        currency: outputCurrency,
      },
    };

    if(tradeExact === TradeExact.INPUT)
      body.input.amount = String(amount); else
    if(tradeExact === TradeExact.OUTPUT)
      body.output.amount = String(amount);
    else
      throw new Error('invalid TRADE_EXACT');

    const { data } = await instance({
      method: 'post',
      url: '/v2/orders/estimate',
      data: body,
    });

    return {
      inputAmount: data.input.amount,
      outputAmount: data.output.amount,
      inputCurrency,
      outputCurrency,
      tradeExact,
      fees: {
        amount: data.price_breakdown.customer_trading_fee.amount,
        currency: data.price_breakdown.customer_trading_fee.currency,
      }
    };
  },

  async order(orderRequest: BityOrderRequest): Promise<BityOrderResponse> {
    const { fromAddress, recipient, reference, rateRequest } = orderRequest;

    const body: any = {
      input: {
        currency: rateRequest.inputCurrency,
        type: 'crypto_address',
        crypto_address: fromAddress,
      },
      output: {
        type: 'bank_account',
        owner: removeEmptyStrings(recipient.owner),
        iban: recipient.iban,
        bic_swift: recipient.bic_swift,
        currency: rateRequest.outputCurrency,
        reference: reference,
      },
    };

    if(rateRequest.tradeExact === TradeExact.INPUT)
      body.input.amount = String(rateRequest.amount); else
    if(rateRequest.tradeExact === TradeExact.OUTPUT)
      body.output.amount = String(rateRequest.amount);
    else
      throw new Error('invalid TRADE_EXACT');

    if(recipient.email) {
      body.contact_person = {
        email: recipient.email,
      };
    }

    try {
      const { headers } = await instance({
        method: 'post',
        url: '/v2/orders',
        data: body,
        withCredentials: true,
      });

      const { data } = await instance({
        method: 'get',
        url: headers.location,
        withCredentials: true,
      });

      if(!data.input) {
        throw new OrderError(
          'api_error',
          [{code: 'cookie', message: 'your browser does not support cookies'}]
        );
      }

      return {
        ...data,
        fees: {
          amount: data.price_breakdown.customer_trading_fee.amount,
          currency: data.price_breakdown.customer_trading_fee.currency,
        }
      };

    } catch(error) {
      if(error?.response?.data?.errors) {
        throw new OrderError(
          'api_error',
          error.response.data.errors
        );
      } else {
        throw error;
      }
    }
  },

  async getOrderDetails(orderId) {
    const { data } = await instance({
      method: 'get',
      url: `/v2/orders/${orderId}`,
      withCredentials: true,
    });

    let orderStatus = 'waiting';
    if(data.timestamp_cancelled) {
      orderStatus = 'cancelled';
    } else if(data.timestamp_executed) {
      orderStatus = 'executed';
    } else if(data.timestamp_payment_received) {
      orderStatus = 'received';
    }

    data.orderStatus = orderStatus;

    return data;
  },

  getOrderStatusPageURL(orderId) {
    return `https://go.bity.com/order-status?id=${orderId}`;
  }
};

export default Bity;
