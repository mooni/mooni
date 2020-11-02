import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/bity';
import { BityOrderResponse } from '../../src/lib/types';

import config from '../../src/config';

const bityInstance = new Bity();

export default async (req: NowRequest, res: NowResponse) => {
  const orderId: string = req.body?.orderId as string;

  if(!orderId) {
    res.status(400).send('wrong body');
    return;
  }

  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  try {
    const orderDetails = (await bityInstance.getOrderDetails(orderId)) as BityOrderResponse;
    res.json(orderDetails)

  } catch(error) {
    if(error.message === 'not-found') {
      res.status(404).send('Not found');
      return;
    } else {
      res.status(500).send('Unexpected server error');
      return;
    }
  }

}
