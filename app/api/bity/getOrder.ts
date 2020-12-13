import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import { Token } from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/auth";

const bityInstance = new Bity();

export default authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  const orderId: string = req.body?.orderId as string;

  if(!orderId) {
    return res.status(400).send('wrong body');
  }

  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  try {
    const orderDetails = await bityInstance.getOrderDetails(orderId);
    if(orderDetails.input.crypto_address.toLowerCase() !== token.claim.iss.toLowerCase()) {
      return res.status(401).send('unauthorized');
    }
    return res.json(orderDetails);
  } catch(error) {
    if(error.message === 'not-found') {
      return res.status(404).send('Not found');
    } else {
      return res.status(500).send('Unexpected server error');
    }
  }

})
