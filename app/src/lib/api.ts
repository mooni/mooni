import axios, { AxiosRequestConfig } from 'axios';
import {BityOrderError, BityOrderResponse} from './wrappers/bityTypes';
import {MultiTrade, MultiTradeEstimation, MultiTradeRequest, TradeRequest} from "./trading/types";
import {MooniOrder, User} from "../types/api";

interface IAPI {
  getBityOrder(orderId: string, jwsToken?: string): Promise<BityOrderResponse>;
  createMultiTrade(multiTradeRequest: MultiTradeRequest, jwsToken: string): Promise<MultiTrade>;
  estimateMultiTrade(tradeRequest: TradeRequest): Promise<MultiTradeEstimation>;
  getOrders(jwsToken: string): Promise<MooniOrder[]>;
  getUser(jwsToken: string): Promise<User>;
}

const API_URL = '/api';
const mooniAPI = axios.create({
  baseURL: API_URL,
  timeout: 9.9 * 1000,
});
const RETRY_ATTEMPTS = 3;

async function mooniAPIRetryer(config: AxiosRequestConfig, attempt: number = 0) {
  if(attempt >= RETRY_ATTEMPTS)
    throw new Error('timeout');

  try {
    return await mooniAPI(config);
  }
  catch (error) {
    if(error.code === 'ECONNABORTED') {
      console.log('timeout retry', config)
      return await mooniAPIRetryer(config, attempt+1);
    }
    throw error;
  }
}

const API: IAPI = {
  async estimateMultiTrade(tradeRequest: TradeRequest): Promise<MultiTradeEstimation> {
    try {
      const {data} = await mooniAPI({
        method: 'post',
        url: 'trading/estimateMultiTrade',
        data: tradeRequest,
      });

      return data;
    }
    catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      if(status === 400 && data?._bityError) {
        throw new BityOrderError(data.message, data.errors);
      } else { // TODO
        throw new Error('unexpected-server-error');
      }
    }
  },
  async createMultiTrade(multiTradeRequest: MultiTradeRequest, jwsToken: string): Promise<MultiTrade> {
    try {
      const {data} = await mooniAPIRetryer({
        method: 'post',
        url: 'trading/createMultiTrade',
        headers: {
          'Authorization': `Bearer ${jwsToken}`,
        },
        data: multiTradeRequest,
      });

      return data;
    }
    catch (error) {
      if(error.message === 'timeout') {
        throw error;
      }
      const status = error.response?.status;
      const data = error.response?.data;
      if(status === 400 && data?._bityError) {
        throw new BityOrderError(data.message, data.errors);
      } else { // TODO
        throw new Error('unexpected-server-error');
      }
    }
  },

  async getBityOrder(bityOrderId: string, jwsToken: string): Promise<BityOrderResponse> {
    try {
      const {data} = await mooniAPI({
        method: 'post',
        url: 'bity/getOrder',
        headers: {
          'Authorization': `Bearer ${jwsToken}`,
        },
        data: {
          bityOrderId,
        },
      });

      return data;
    }
    catch (error) {
      if(error.response?.status === 404) {
        throw new Error('not-found');
      } else {
        throw new Error('unexpected-server-error');
      }
    }
  },
  async getOrders(jwsToken: string): Promise<MooniOrder[]> {
    try {
      const {data} = await mooniAPI({
        method: 'get',
        url: 'orders',
        headers: {
          'Authorization': `Bearer ${jwsToken}`,
        },
      });

      return data;
    }
    catch (error) {
      throw new Error('unexpected-server-error');
    }
  },
  async getUser(jwsToken: string): Promise<User> {
    const {data} = await mooniAPI({
      method: 'get',
      url: 'user',
      headers: {
        'Authorization': `Bearer ${jwsToken}`,
      },
    });

    return data;
  }
};

export default API;
