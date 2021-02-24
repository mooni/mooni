import {NowRequest, NowResponse} from '@now/node'

import {Token} from "../../../src/lib/didManager";
import {authMiddleware} from "../../../src/lib/api/authMiddleware";
import {errorMiddleware} from "../../../src/lib/api/errorMiddleware";
import prisma, {OrderStatus} from '../../../src/lib/api/prisma'
import { APIError } from '../../../src/lib/errors';
import { getOrder } from './index';

export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  const multiTradeId = req.query?.id as string;
  const txHash = req.body?.txHash as string;

  if(!multiTradeId || !txHash) {
    throw new APIError(400, 'wrong-body', '[multiTradeId, txHash] required');
  }

  const mooniOrder = await getOrder(multiTradeId, token.claim.iss);
  if(mooniOrder.txHash || mooniOrder.status !== OrderStatus.PENDING) {
    throw new APIError(400, 'invalid', 'Order already has a txHash set');
  }

  await prisma.mooniOrder.update({
    where: { id: multiTradeId },
    data: {
      txHash,
      status: OrderStatus.PAID,
    },
  });

  res.json({ message: 'ok' })
}))
