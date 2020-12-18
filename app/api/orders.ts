import { NowRequest, NowResponse } from '@now/node'
import prisma from "../src/lib/api/prisma";
import {authMiddleware} from "../src/lib/api/auth";
import {Token} from "../src/lib/didManager";

export default authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  const ethAddress = token.claim.iss;
  const data = await prisma.mooniOrder.findMany({
    where: {
      ethAddress: ethAddress.toLowerCase(),
    }
  });
  res.json(data)
});
