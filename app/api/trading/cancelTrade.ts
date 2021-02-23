import {NowRequest, NowResponse} from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import {Token} from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/authMiddleware";
import {errorMiddleware} from "../../src/lib/api/errorMiddleware";
import prisma from '../../src/lib/api/prisma'
import {APIError} from "../../src/lib/errors";
import { compareAddresses } from '../../src/lib/api/ethHelpers';
import { BityOrderError } from '../../src/lib/wrappers/bityTypes';

const bityInstance = new Bity();

export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {

  const id = req.body?.multiTradeId as string;
  if(!id) {
    throw new APIError(400, 'wrong-body', 'multiTradeRequest values are invalid');
  }

  const mooniOrder = await prisma.mooniOrder.findUnique({
    where: { id },
  });
  if(!mooniOrder || !compareAddresses(mooniOrder.ethAddress, token.claim.iss)) {
    throw new APIError(404, 'not-found', 'MooniOrder not found');
  }
  const { bityOrderId } = mooniOrder;
  if(!bityOrderId) {
    throw new APIError(400, 'invalid-order', 'no bityOrderId present');
  }

  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  try {
    await bityInstance.cancelOrder(bityOrderId);
    await prisma.mooniOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    return res.json({ message: 'ok'});
  } catch(error) {
    if(error instanceof BityOrderError && error.meta?.errors[0]?.code === 'order_is_cancelled') {
      return res.json({ message: 'ok', alreadyCancelled: true })
    }
    else {
      throw error;
    }
  }

}))
