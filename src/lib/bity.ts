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
import BN from "bignumber.js";
import {SIGNIFICANT_DIGITS} from "./currencies";

const API_URL = 'https://exchange.api.bity.com';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
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
  let feesAmount = order.price_breakdown.customer_trading_fee.amount;
  let feesCurrency = order.price_breakdown.customer_trading_fee.currency;

  if(feesCurrency === order.input.currency) {
    feesAmount = new BN(feesAmount).times(order.output.amount).div(order.input.amount).sd(SIGNIFICANT_DIGITS).toString();
    feesCurrency = order.output.currency;
  }

  return {
    amount: feesAmount,
    currency: feesCurrency,
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

    let orderStatus: BityOrderStatus= BityOrderStatus.WAITING;
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
