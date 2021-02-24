import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import {Token} from "../../src/lib/didManager";
import {authMiddleware, errorMiddleware} from "../../apiLib/middlewares";
import prisma from '../../apiLib/prisma'
import {APIError} from "../../src/lib/errors";
import { compareAddresses } from '../../apiLib/ethHelpers';
import { getBityOrder } from '../../apiLib/orders';

// Get order from bity
export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {

  const bityOrderId: string = req.body?.bityOrderId as string;
  if(!bityOrderId) {
    throw new APIError(400, 'wrong-body', '{ bityOrderId } is required');
  }

  const mooniOrder = await prisma.mooniOrder.findUnique({
    where: { bityOrderId },
  });
  if(!mooniOrder || !compareAddresses(mooniOrder.ethAddress, token.claim.iss)) {
    throw new APIError(404, 'not-found', 'Corresponding MooniOrder not found');
  }
  const bityInstance = new Bity();
  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  const bityOrderDetails = await getBityOrder(bityInstance, mooniOrder);
  return res.json(bityOrderDetails);

}))
