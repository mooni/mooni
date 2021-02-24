import {NowRequest, NowResponse} from '@now/node'

import Bity from '../../../src/lib/wrappers/bity';
import config from '../../../src/config';
import {Token} from "../../../src/lib/didManager";
import {authMiddleware} from "../../../src/lib/api/authMiddleware";
import {errorMiddleware} from "../../../src/lib/api/errorMiddleware";
import prisma, { MooniOrder, OrderStatus } from '../../../src/lib/api/prisma';
import {APIError} from "../../../src/lib/errors";
import { BityOrderError } from '../../../src/lib/wrappers/bityTypes';
import { getOrder } from './index';

export async function cancelOrder(mooniOrder: MooniOrder) {
  const { bityOrderId } = mooniOrder;
  if(!bityOrderId) {
    throw new APIError(400, 'invalid-order', 'no bityOrderId present');
  }

  const bityInstance = new Bity();
  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  try {
    await bityInstance.cancelOrder(bityOrderId);
    await prisma.mooniOrder.update({
      where: { id: mooniOrder.id },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });
  } catch(error) {
    if(error instanceof BityOrderError && error.meta?.errors[0]?.code === 'order_is_cancelled') {
      return;
    }
    else {
      throw error;
    }
  }
}
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

  await cancelOrder(mooniOrder);

  res.json({ message: 'ok' })
}))
