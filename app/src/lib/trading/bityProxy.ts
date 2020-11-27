import axios from 'axios';
import config from '../../config';
import {BankInfo, ETHInfo, TradeRequest} from './types';
import Bity, { BityOrderResponse, BityOrderError } from './bity';

const { useAPI } = config;
const { bityClientId } = config;
const bityInstance = new Bity({ bityClientId });

interface IBityProxy {
  createOrder(tradeRequest: TradeRequest, bankInfo: BankInfo, ethInfo: ETHInfo, jwsToken: string): Promise<BityOrderResponse>;
  getOrder(orderId: string, jwsToken?: string): Promise<BityOrderResponse>;
}

const API_URL = '/api';
const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const BityProxy: IBityProxy = {
  createOrder: useAPI ?
    async function(tradeRequest: TradeRequest, bankInfo: BankInfo, ethInfo: ETHInfo, jwsToken: string): Promise<BityOrderResponse> {
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
        if(error.response?.status === 400 && error.response?.data?.errors) {
          throw new BityOrderError(
            'api_error',
            error.response.data.errors
          );
        } else {
          throw error;
        }
      }
    }
    :
    bityInstance.order.bind(bityInstance),

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
