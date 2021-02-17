import {NowRequest, NowResponse} from '@now/node'

import {Token} from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/authMiddleware";
import {errorMiddleware} from "../../src/lib/api/errorMiddleware";
import prisma from '../../src/lib/api/prisma'
import { APIError } from '../../src/lib/errors';
import { compareAddresses } from '../../src/lib/api/ethHelpers';

export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {

  const multiTradeId = req.body?.multiTradeId as string;
  const txHash = req.body?.txHash as string;

  if(!multiTradeId || !txHash) {
    throw new APIError(400, 'wrong-body', '[multiTradeId, txHash] required');
  }

  const mooniOrder = await prisma.mooniOrder.findUnique({
    where: {
      id: multiTradeId,
    },
  });
  if(!mooniOrder || !compareAddresses(mooniOrder.ethAddress, token.claim.iss)) {
    throw new APIError(404, 'not-found', 'MooniOrder not found');
  }
  if(mooniOrder.txHash) {
    throw new APIError(400, 'invalid', 'Order already has a txHash set');
  }
  await prisma.mooniOrder.update({
    where: { id: multiTradeId },
    data: { txHash },
  });

  res.json({ message: 'ok' })
}))
