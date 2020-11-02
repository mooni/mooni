import axios from 'axios';
import {BityOrderResponse, OrderError, OrderRequest} from "./types";

const API_URL = '/api';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

const MooniAPI = {
  async bityCreateOrder(orderRequest: OrderRequest, fromAddress: string): Promise<BityOrderResponse> {
    try {
      const { data } = await instance({
        method: 'post',
        url: 'bity/createOrder',
        data: {
          orderRequest,
          fromAddress,
        },
      });

      return data;
    } catch(error) {
      if(error.response?.status === 400 && error.response?.data?.errors) {
        throw new OrderError(
          'api_error',
          error.response.data.errors
        );
      } else {
        throw error;
      }
    }
  },
  async bityGetOrder(orderId: string): Promise<BityOrderResponse> {
    try {
      const {data} = await instance({
        method: 'post',
        url: 'bity/getOrder',
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
  },
};

export default MooniAPI;
