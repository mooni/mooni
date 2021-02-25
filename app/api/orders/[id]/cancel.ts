import {NowRequest, NowResponse} from '@now/node'

import Bity from '../../../src/lib/wrappers/bity';
import config from '../../../src/config';
import {Token} from "../../../src/lib/didManager";
import {authMiddleware, errorMiddleware} from '../../../apiLib/middlewares';
import { OrderStatus } from '../../../apiLib/prisma';
import { APIError } from "../../../src/lib/errors";
import { getOrder, cancelOrder } from '../../../apiLib/orders';

// Cancel order
export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  const id = req.query?.id as string;
  if(!id) {
    throw new APIError(400, 'wrong-body', 'multiTradeRequest values are invalid');
  }
  const mooniOrder = await getOrder(id, token.claim.iss);

  if(mooniOrder.status !== OrderStatus.PENDING) {
    throw new APIError(400, 'invalid-order', 'can only cancel pending orders');
  }
  const bityInstance = new Bity();
  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  await cancelOrder(bityInstance, mooniOrder);

  res.json({ message: 'ok' })
}))
