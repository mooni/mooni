import BN from 'bignumber.js';
import axios from 'axios';
import {
  BityOrderResponse,
  BityOrderStatus,
  OrderError,
  OrderRequest,
  RateRequest,
  RateResult,
  TradeExact,
} from './types';
import config from '../config';
import { MetaError } from './errors';

const API_URL = 'https://exchange.api.bity.com';

const { bityClientId, bityPartnerFee } = config;

const instance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: bityClientId !== '' ?
    { 'X-Client-Id': bityClientId }
    :
    {},
});

function removeEmptyStrings(data: object = {}) {
  return Object.keys(data).reduce((acc, prop) => {
      if(data[prop] !== '' && data[prop] !== undefined) {
        return Object.assign(acc, { [prop]: data[prop] });
      }
      return acc;
    },
    {});
}

function extractFees(order: any): { amount: string, currency: string}  {
  const inputCurrency = order.input.currency;
  const outputCurrency = order.output.currency;

  const fees = Object.keys(order.price_breakdown).map(key => order.price_breakdown[key]);
  const sameCurrencies = new Set(fees.map(f => f.currency).concat(inputCurrency)).size === 1;

  if(!sameCurrencies) {
    throw new MetaError('Incompatible fee currencies', order);
  }

  const totalAmountInputCurrency = fees
    .map(f => f.amount)
    .reduce((acc, a) => acc.plus(a), new BN(0));

  const totalAmountOutputCurrency = totalAmountInputCurrency
    .times(order.output.amount).div(order.input.amount).toFixed();

  return {
    amount: totalAmountOutputCurrency,
    currency: outputCurrency,
  };
}

const Bity = {
  async estimate(rateRequest: RateRequest): Promise<RateResult> {
    const { inputCurrency, outputCurrency, amount, tradeExact } = rateRequest;

    const body: any = {
      input: {
        currency: inputCurrency,
      },
      output: {
        currency: outputCurrency,
      },
      partner_fee: { factor: bityPartnerFee }
    };

    if(bityPartnerFee) {
      body.partner_fee = { factor: bityPartnerFee };
    }

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
      fees: extractFees(data),
    };
  },

  async order(orderRequest: OrderRequest, fromAddress: string): Promise<BityOrderResponse> {
    const { recipient, reference, rateRequest } = orderRequest;

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
        currency: rateRequest.outputCurrency,
        reference: reference,
      },
    };

    if(bityPartnerFee) {
      body.partner_fee = { factor: bityPartnerFee };
    }

    if(recipient.bic_swift) {
      body.output.bic_swift = recipient.bic_swift;
    }

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
        fees: extractFees(data),
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

  async getOrderDetails(orderId: string): Promise<BityOrderResponse> {
    const { data } = await instance({
      method: 'get',
      url: `/v2/orders/${orderId}`,
      withCredentials: true,
    });

    let orderStatus: BityOrderStatus = BityOrderStatus.WAITING;
    if(data.timestamp_cancelled) {
      orderStatus = BityOrderStatus.CANCELLED;
    } else if(data.timestamp_executed) {
      orderStatus = BityOrderStatus.EXECUTED;
    } else if(data.timestamp_payment_received) {
      orderStatus = BityOrderStatus.RECEIVED;
    }

    data.orderStatus = orderStatus;

    return data;
  },

  getOrderStatusPageURL(orderId: string) {
    return `https://go.bity.com/order-status?id=${orderId}`;
  }
};

export default Bity;
