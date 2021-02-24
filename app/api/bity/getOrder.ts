import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import {Token} from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/authMiddleware";
import { BityOrderResponse, BityOrderStatus } from '../../src/lib/wrappers/bityTypes';
import prisma, {MooniOrder, OrderStatus} from '../../src/lib/api/prisma'
import {APIError} from "../../src/lib/errors";
import {errorMiddleware} from "../../src/lib/api/errorMiddleware";
import { compareAddresses } from '../../src/lib/api/ethHelpers';

export async function getBityOrder(mooniOrder: MooniOrder): Promise<BityOrderResponse> {
  const { bityOrderId } = mooniOrder;
  if(!bityOrderId) {
    throw new APIError(400, 'invalid-order', 'no bityOrderId present');
  }

  const bityInstance = new Bity();
  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);
  return bityInstance.getOrderDetails(bityOrderId);
}

export async function updateStatusFromBity(mooniOrder: MooniOrder): Promise<void> {
  const bityOrderDetails = await getBityOrder(mooniOrder);

  if(bityOrderDetails.orderStatus === BityOrderStatus.EXECUTED) {
    await prisma.mooniOrder.update({
      where: { id: mooniOrder.id },
      data: {
        status: OrderStatus.EXECUTED,
        executedAt: bityOrderDetails.timestamp_executed,
      },
    });
  } else if(bityOrderDetails.orderStatus === BityOrderStatus.CANCELLED) {
    await prisma.mooniOrder.update({
      where: { id: mooniOrder.id },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });
  }
}

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

  const bityOrderDetails = await getBityOrder(mooniOrder);
  return res.json(bityOrderDetails);

}))
