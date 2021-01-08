import axios, {AxiosInstance} from 'axios';
import qs from 'qs';
import {BankInfo, BityTrade, ETHInfo, Fee, TradeExact, TradeRequest, TradeType,} from '../trading/types';
import config from '../../config';
import {BN} from '../numbers';
import {MetaError} from '../errors';

import {BityOrderResponse, BityOrderError, BityOrderStatus} from './bityTypes'

const API_URL = 'https://exchange.api.bity.com';
const AUTH_URL = 'https://connect.bity.com/oauth2/token';
const TIMEOUT = 10 * 1000;

const { bityPartnerFee } = config.private;

function removeEmptyStrings(data: object = {}) {
  return Object.keys(data).reduce((acc, prop) => {
      if(data[prop] !== '' && data[prop] !== undefined) {
        return Object.assign(acc, { [prop]: data[prop] });
      }
      return acc;
    },
    {});
}

function extractFees(order: any): Fee  {
  const fees = Object.keys(order.price_breakdown).map(key => order.price_breakdown[key]);

  // expect the fees to be in the same currency
  const sameCurrencies = new Set(fees.map(f => f.currency)).size === 1;
  if(!sameCurrencies) {
    throw new MetaError('Incompatible fee currencies', order);
  }

  const totalAmountInputCurrency = fees
    .map(f => f.amount)
    .reduce((acc, a) => acc.plus(a), new BN(0))
    .toFixed();
  const currencySymbol = fees[0].currency;

  return {
    amount: totalAmountInputCurrency,
    currencySymbol,
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

  async estimate(tradeRequest: TradeRequest): Promise<BityTrade> {
    const { inputCurrencySymbol, outputCurrencySymbol, amount, tradeExact } = tradeRequest;

    const body: any = {
      input: {
        currency: inputCurrencySymbol,
      },
      output: {
        currency: outputCurrencySymbol,
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

    const { data: bityOrderResponse } = await this.instance({
      method: 'post',
      url: '/v2/orders/estimate',
      data: body,
    });

    if(
      bityOrderResponse.input.amount === bityOrderResponse.input.minimum_amount
      ||
      bityOrderResponse.output.amount === bityOrderResponse.output.minimum_amount
    ) {
      throw new BityOrderError(
        'bity_amount_too_low',
        [{ minimumOutputAmount: bityOrderResponse.output.amount}]
      )
    }

    return {
      tradeRequest,
      inputAmount: bityOrderResponse.input.amount,
      outputAmount: bityOrderResponse.output.amount,
      tradeType: TradeType.BITY,
      bityOrderResponse,
      fee: extractFees(bityOrderResponse),
    };
  }

  async createOrder(tradeRequest: TradeRequest, bankInfo: BankInfo, ethInfo: ETHInfo): Promise<BityTrade> {
    const { recipient, reference } = bankInfo;

    const body: any = {
      input: {
        currency: tradeRequest.inputCurrencySymbol,
        type: 'crypto_address',
        crypto_address: ethInfo.fromAddress,
      },
      output: {
        type: 'bank_account',
        owner: removeEmptyStrings(recipient.owner),
        iban: recipient.iban,
        currency: tradeRequest.outputCurrencySymbol,
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

      const { data: bityOrderResponse } = await this.instance({
        method: 'get',
        url: headers.location,
        withCredentials: this.withCredentials,
      });

      if(!bityOrderResponse.input) {
        throw new BityOrderError(
          'api_error',
          [{code: 'cookie', message: 'your browser does not support cookies'}]
        );
      }

      return {
        tradeRequest,
        inputAmount: bityOrderResponse.input.amount,
        outputAmount: bityOrderResponse.output.amount,
        tradeType: TradeType.BITY,
        bityOrderResponse,
        fee: extractFees(bityOrderResponse),
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

export default Bity;
