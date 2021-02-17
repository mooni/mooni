import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import {Token} from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/authMiddleware";
import { BityOrderStatus } from "../../src/lib/wrappers/bityTypes";
import prisma from '../../src/lib/api/prisma'
import {APIError} from "../../src/lib/errors";
import {errorMiddleware} from "../../src/lib/api/errorMiddleware";
import { compareAddresses } from '../../src/lib/api/ethHelpers';

const bityInstance = new Bity();

export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {

  const bityOrderId: string = req.body?.bityOrderId as string;

  if(!bityOrderId) {
    throw new APIError(400, 'wrong-body', '{ bityOrderId } is required');
  }

  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  const mooniOrder = await prisma.mooniOrder.findUnique({
    where: { bityOrderId },
  });
  if(!mooniOrder) {
    throw new APIError(404, 'not-found', 'Corresponding MooniOrder not found');
  }
  const bityOrderDetails = await bityInstance.getOrderDetails(bityOrderId);
  if(!compareAddresses(bityOrderDetails.input.crypto_address, token.claim.iss)) {
    throw new APIError(401, 'unauthorized');
  }
  if(bityOrderDetails.orderStatus === BityOrderStatus.EXECUTED) {
    await prisma.mooniOrder.update({
      where: { bityOrderId },
      data: {
        status: 'EXECUTED',
        executedAt: bityOrderDetails.timestamp_executed,
      },
    });
  }
  return res.json(bityOrderDetails);

}))
