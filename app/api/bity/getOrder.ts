import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import {Token} from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/auth";
import {BityOrderStatus} from "../../src/lib/wrappers/bityTypes";
import prisma from '../../src/lib/api/prisma'

const bityInstance = new Bity();

export default authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  const bityOrderId: string = req.body?.bityOrderId as string;

  if(!bityOrderId) {
    return res.status(400).send('wrong body');
  }

  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  try {
    const mooniOrder = await prisma.mooniOrder.findUnique({
      where: { bityOrderId },
    });
    if(!mooniOrder) {
      throw new Error('not-found');
    }
    const bityOrderDetails = await bityInstance.getOrderDetails(bityOrderId);
    if(bityOrderDetails.input.crypto_address.toLowerCase() !== token.claim.iss.toLowerCase()) {
      return res.status(401).send('unauthorized');
    }
    if(bityOrderDetails.orderStatus === BityOrderStatus.EXECUTED) {
      await prisma.mooniOrder.update({
        where: { bityOrderId },
        data: { status: 'EXECUTED' },
      });
    }
    return res.json(bityOrderDetails);
  } catch(error) {
    if(error.message === 'not-found') {
      return res.status(404).send('Not found');
    } else {
      return res.status(500).send('Unexpected server error');
    }
  }

})
