import axios from 'axios';
import config from '../../config';
import {BankInfo, BityTrade, ETHInfo, TradeRequest} from './types';
import Bity, { BityOrderResponse, BityOrderError } from './bity';

const { useAPI } = config;
const { bityClientId } = config;
const bityInstance = new Bity({ bityClientId });

interface IBityProxy {
  estimateOrder(tradeRequest: TradeRequest): Promise<BityTrade>;
  createOrder(tradeRequest: TradeRequest, bankInfo: BankInfo, ethInfo: ETHInfo, jwsToken?: string): Promise<BityTrade>;
  getOrder(orderId: string, jwsToken?: string): Promise<BityOrderResponse>;
}

const API_URL = '/api';
const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const BityProxy: IBityProxy = {
  estimateOrder(tradeRequest: TradeRequest) {
    return bityInstance.estimate(tradeRequest)
  },
  createOrder: useAPI ?
    async function(tradeRequest: TradeRequest, bankInfo: BankInfo, ethInfo: ETHInfo, jwsToken: string): Promise<BityTrade> {
      try {
        const { data } = await instance({
          method: 'post',
          url: 'bity/createOrder',
          headers: {
            'Authorization': `Bearer ${jwsToken}`,
          },
          data: {
            tradeRequest,
            bankInfo,
            ethInfo,
          },
        });

        return data;
      } catch(error) {
        const data = error.response?.data;
        if(error.response?.status === 400 && data?._orderError) {
          throw new BityOrderError(data.message, data.errors);
        } else {
          throw error;
        }
      }
    }
    :
    bityInstance.createOrder.bind(bityInstance),

  getOrder: useAPI ?
    async function(orderId: string, jwsToken: string): Promise<BityOrderResponse> {
      try {
        const {data} = await instance({
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
        if(error.response?.status === 404) {
          throw new Error('not-found');
        } else {
          throw new Error('unexpected-server-error-bity');
        }
      }
    }
    :
    bityInstance.getOrderDetails.bind(bityInstance),
};

export default BityProxy;
