import axios from 'axios';
import { BityOrderResponse } from '../wrappers/bityTypes';
import {MultiTrade, MultiTradeRequest, TradeRequest} from "./types";

interface IAPI {
  getOrder(orderId: string, jwsToken?: string): Promise<BityOrderResponse>;
  createMultiTrade(multiTradeRequest: MultiTradeRequest, jwsToken: string): Promise<MultiTrade>;
  estimateMultiTrade(tradeRequest: TradeRequest): Promise<MultiTrade>;
}

const API_URL = '/api';
const mooniAPI = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

const API: IAPI = {
  async estimateMultiTrade(tradeRequest: TradeRequest): Promise<MultiTrade> {
    try {
      const {data} = await mooniAPI({
        method: 'post',
        url: 'trading/estimateMultiTrade',
        data: tradeRequest,
      });

      return data;
    }
    catch (error) {
      if(error.response?.status === 404) { // TODO
        throw new Error('not-found');
      } else {
        throw new Error('unexpected-server-error');
      }
    }
  },
  async createMultiTrade(multiTradeRequest: MultiTradeRequest, jwsToken: string): Promise<MultiTrade> {
    try {
      const {data} = await mooniAPI({
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
      if(error.response?.status === 404) { // TODO
        throw new Error('not-found');
      } else {
        throw new Error('unexpected-server-error');
      }
    }
  },

  getOrder: async function(orderId: string, jwsToken: string): Promise<BityOrderResponse> {
    try {
      const {data} = await mooniAPI({
        method: 'post',
        url: 'bity/getOrder',
        headers: {
          'Authorization': `Bearer ${jwsToken}`,
        },
        data: {
          orderId,
        },
      });

      return data;
    }
    catch (error) {
      if(error.response?.status === 404) { // TODO
        throw new Error('not-found');
      } else {
        throw new Error('unexpected-server-error');
      }
    }
  }
};

export default API;
