import { NowRequest, NowResponse } from '@now/node'
import prisma from "../../apiLib/prisma";
import {authMiddleware} from "../../apiLib/middlewares/authMiddleware";
import {Token} from "../../src/lib/didManager";
import { errorMiddleware } from '../../apiLib/middlewares/errorMiddleware';

// Get all user orders
export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  const ethAddress = token.claim.iss.toLowerCase();
  const orders = await prisma.mooniOrder.findMany({
    where: {
      ethAddress,
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  });
  res.json(orders)
}));
