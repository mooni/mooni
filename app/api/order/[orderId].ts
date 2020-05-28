import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/bity';
import { BityOrderResponse } from '../../src/lib/types';

export default async (req: NowRequest, res: NowResponse) => {
  const orderId: string = req.query.orderId as string;

  try {
    const orderDetails = (await Bity.getOrderDetails(orderId)) as BityOrderResponse;
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
