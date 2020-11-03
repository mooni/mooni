import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/bity';
import { BityOrderResponse } from '../../src/lib/types';

import config from '../../src/config';
import DIDManager, { Token } from "../../src/lib/didManager";

const bityInstance = new Bity();

function getHeaderToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  if (token.length === 0) return null;
  return token;
}

export default async (req: NowRequest, res: NowResponse) => {
  const orderId: string = req.body?.orderId as string;

  if(!orderId) {
    return res.status(400).send('wrong body');
  }
  const jwsToken: string = getHeaderToken(req);
  if(!jwsToken) {
    return res.status(401).send('authorization required');
  }
  let token: Token;
  try {
    token = DIDManager.decodeToken(jwsToken);
  } catch(error) {
    return res.status(401).send('invalid token');
  }

  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  try {
    const orderDetails = (await bityInstance.getOrderDetails(orderId)) as BityOrderResponse;
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

}
