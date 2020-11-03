import {BityOrderResponse, OrderRequest} from './types';
import MooniAPI from './api';
import Bity from './bity';
import config from '../config';

const { useAPI } = config;
const { bityClientId } = config;
const bityInstance = new Bity({ bityClientId });

interface IBityProxy {
  createOrder(orderRequest: OrderRequest, fromAddress: string, jwsToken?: string): Promise<BityOrderResponse>;
  getOrder(orderId: string, jwsToken?: string): Promise<BityOrderResponse>;
}

const BityProxy: IBityProxy = {
  createOrder: useAPI ? MooniAPI.bityCreateOrder : bityInstance.order.bind(bityInstance),
  getOrder: useAPI ? MooniAPI.bityGetOrder : bityInstance.getOrderDetails.bind(bityInstance),
};

export default BityProxy;
