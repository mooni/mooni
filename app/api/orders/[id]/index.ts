import {NowRequest, NowResponse} from '@now/node'

import {Token} from "../../../src/lib/didManager";
import {authMiddleware} from "../../../src/lib/api/authMiddleware";
import {errorMiddleware} from "../../../src/lib/api/errorMiddleware";
import prisma, {MooniOrder, OrderStatus} from '../../../src/lib/api/prisma'
import {APIError} from "../../../src/lib/errors";
import { compareAddresses } from '../../../src/lib/api/ethHelpers';
import { updateStatusFromBity } from '../../bity/getOrder';
import { cancelOrder } from './cancel';

export async function getOrder(id: string, userAddress: string): Promise<MooniOrder> {
  const mooniOrder = await prisma.mooniOrder.findUnique({
    where: { id },
  });
  if(!mooniOrder || !compareAddresses(mooniOrder.ethAddress, userAddress)) {
    throw new APIError(404, 'not-found', 'MooniOrder not found');
  }
  return mooniOrder;
}

const EXPIRATION = 8*60*1000; // 8 minutes

// Get order
export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  const id = req.query?.id as string;
  if(!id) {
    throw new APIError(400, 'wrong-body', 'multiTradeRequest values are invalid');
  }
  const mooniOrder = await getOrder(id, token.claim.iss);

  if(mooniOrder.status === OrderStatus.PENDING) {
    const now = new Date();
    if((+now - +mooniOrder.createdAt) > EXPIRATION) {
      await cancelOrder(mooniOrder);
      const updatedMooniOrder = await getOrder(id, token.claim.iss);
      return res.json(updatedMooniOrder);
    }
  }
  if(mooniOrder.status === OrderStatus.PAID) {
    await updateStatusFromBity(mooniOrder);
    const updatedMooniOrder = await getOrder(id, token.claim.iss);
    return res.json(updatedMooniOrder);
  }

  return res.json(mooniOrder);
}))
