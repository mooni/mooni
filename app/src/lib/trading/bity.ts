import BN from 'bignumber.js';
import axios, { AxiosInstance } from 'axios';
import qs from 'qs';
import {
  BankInfo,
  Trade,
  TradeExact, TradeRequest,
  ETHInfo,
  Fee
} from './types';
import config from '../../config';
import { MetaError } from '../errors';
import { JSBI } from '@uniswap/sdk';

const API_URL = 'https://exchange.api.bity.com';
const AUTH_URL = 'https://connect.bity.com/oauth2/token';
const TIMEOUT = 10 * 1000;

const { bityPartnerFee } = config;

function removeEmptyStrings(data: object = {}) {
  return Object.keys(data).reduce((acc, prop) => {
      if(data[prop] !== '' && data[prop] !== undefined) {
        return Object.assign(acc, { [prop]: data[prop] });
      }
      return acc;
    },
    {});
}

function extractFees(order: any, currency): Fee  {
  const inputCurrency = order.input.currency;

  const fees = Object.keys(order.price_breakdown).map(key => order.price_breakdown[key]);
  // expect the fees to be in the currency of the input
  const sameCurrencies = new Set(fees.map(f => f.currency).concat(inputCurrency)).size === 1;

  if(!sameCurrencies) {
    throw new MetaError('Incompatible fee currencies', order);
  }

  const totalAmountInputCurrency = fees
    .map(f => f.amount)
    .reduce((acc, a) => acc.plus(a), JSBI.BigInt(0));

  if(currency.symbol === inputCurrency) {
    return {
      amount: totalAmountInputCurrency,
      currency: currency,
    }
  } else {
    const totalAmountOutputCurrency = totalAmountInputCurrency
      .times(order.output.amount).div(order.input.amount);

    return {
      amount: totalAmountOutputCurrency,
      currency: currency,
    };

  }
}

class Bity {
  instance: AxiosInstance;
  withCredentials: boolean;

  constructor({ bityClientId }: {bityClientId?: string} = {}) {
    const headers = {};
    this.withCredentials = false;

    if(bityClientId) {
      headers['X-Client-Id'] = bityClientId;
      this.withCredentials = true;
    }

    this.instance = axios.create({
      baseURL: API_URL,
      timeout: TIMEOUT,
      headers,
    });
  }

  async initializeAuth(client_id: string, client_secret: string) {
    const { data } = await axios({
      method: 'post',
      url: AUTH_URL,
      data: qs.stringify({
        grant_type: 'client_credentials',
        scope: 'https://auth.bity.com/scopes/reporting.exchange',
        client_id,
        client_secret,
      }),
    });
    const { access_token } = data;

    this.instance = axios.create({
      baseURL: API_URL,
      timeout: TIMEOUT,
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
  }

  async estimate(tradeRequest: TradeRequest): Promise<Trade> {
    const { inputCurrency, outputCurrency, amount, tradeExact } = tradeRequest;

    const body: any = {
      input: {
        currency: inputCurrency.symbol,
      },
      output: {
        currency: outputCurrency.symbol,
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

    const { data } = await this.instance({
      method: 'post',
      url: '/v2/orders/estimate',
      data: body,
    });

    return {
      tradeRequest,
      inputAmount: data.input.amount,
      outputAmount: data.output.amount,
      fee: extractFees(data, outputCurrency),
    };
  }

  async order(tradeRequest: TradeRequest, bankInfo: BankInfo, ethInfo: ETHInfo, jwsToken: string): Promise<BityOrderResponse> {
    const { recipient, reference } = bankInfo;

    const body: any = {
      input: {
        currency: tradeRequest.inputCurrency.symbol,
        type: 'crypto_address',
        crypto_address: ethInfo.fromAddress,
      },
      output: {
        type: 'bank_account',
        owner: removeEmptyStrings(recipient.owner),
        iban: recipient.iban,
        currency: tradeRequest.outputCurrency.symbol,
        reference: reference,
      },
    };

    if(bityPartnerFee) {
      body.partner_fee = { factor: bityPartnerFee };
    }

    if(recipient.bic_swift) {
      body.output.bic_swift = recipient.bic_swift;
    }

    if(tradeRequest.tradeExact === TradeExact.INPUT)
      body.input.amount = String(tradeRequest.amount); else
    if(tradeRequest.tradeExact === TradeExact.OUTPUT)
      body.output.amount = String(tradeRequest.amount);
    else
      throw new Error('invalid TRADE_EXACT');

    if(recipient.email) {
      body.contact_person = {
        email: recipient.email,
      };
    }

    try {
      const { headers } = await this.instance({
        method: 'post',
        url: '/v2/orders',
        data: body,
        withCredentials: this.withCredentials,
      });

      const { data } = await this.instance({
        method: 'get',
        url: headers.location,
        withCredentials: this.withCredentials,
      });

      if(!data.input) {
        throw new BityOrderError(
          'api_error',
          [{code: 'cookie', message: 'your browser does not support cookies'}]
        );
      }

      return {
        ...data,
        fees: extractFees(data, tradeRequest.outputCurrency),
      };

    } catch(error) {
      if(error?.response?.data?.errors) {
        throw new BityOrderError(
          'api_error',
          error.response.data.errors
        );
      } else {
        throw error;
      }
    }
  }

  async getOrderDetails(orderId: string): Promise<BityOrderResponse> {
    try {

      const { data } = await this.instance({
        method: 'get',
        url: `/v2/orders/${orderId}`,
        withCredentials: this.withCredentials,
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

    } catch(error) {

        if(error.response?.status === 404) {
          throw new Error('not-found');
        } else {
          throw new Error('unexpected-server-error-bity');
        }

    }

  }

  static getOrderStatusPageURL(orderId: string) {
    return `https://go.bity.com/order-status?id=${orderId}`;
  }
}

const bityDefaultInstance = new Bity();

export { bityDefaultInstance };

export enum BityOrderStatus {
  WAITING = 'WAITING',
  CANCELLED = 'CANCELLED',
  EXECUTED = 'EXECUTED',
  RECEIVED = 'RECEIVED',
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
  },
  orderStatus?: BityOrderStatus;
};

export type BityOrderErrors = any[];

export class BityOrderError extends Error {
  errors: BityOrderErrors;
  _orderError: boolean;
  constructor(message: string, errors: BityOrderErrors = []) {
    super(message);
    this._orderError = true;
    this.errors = errors;
  }
}


export default Bity;
