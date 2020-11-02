import BN from 'bignumber.js';
import axios, { AxiosInstance } from 'axios';
import qs from 'qs';
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
const AUTH_URL = 'https://connect.bity.com/oauth2/token';

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

class Bity {
  instance: AxiosInstance;
  withCredentials: boolean;

  constructor({ bityClientId }: {bityClientId?: string, token?: string} = {}) {
    const headers = {};
    this.withCredentials = false;

    if(bityClientId) {
      headers['X-Client-Id'] = bityClientId;
      this.withCredentials = true;
    }

    this.instance = axios.create({
      baseURL: API_URL,
      timeout: 5000,
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
      timeout: 5000,
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
  }

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

    const { data } = await this.instance({
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
  }

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

export default Bity;
