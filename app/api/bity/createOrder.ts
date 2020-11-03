import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/bity';
import { BityOrderResponse, OrderRequest } from '../../src/lib/types';
import config from '../../src/config';

const bityInstance = new Bity();

export default async (req: NowRequest, res: NowResponse) => {
  if(!req.body) {
    res.status(400).send('no body');
    return;
  }

  const orderRequest: OrderRequest = req.body.orderRequest as OrderRequest;
  const fromAddress: string = req.body.fromAddress as string;

  if(!orderRequest || !fromAddress) {
    res.status(400).send('wrong body');
    return;
  }

  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  try {
    const orderDetails = (await bityInstance.order(orderRequest, fromAddress)) as BityOrderResponse;
    res.json(orderDetails)

  } catch(error) {
    if(error.message === 'api_error') {
      res.status(400).json({ errors: error.errors });
      return;
    } else {
      res.status(500).send('Unexpected server error');
      return;
    }
  }

}
