import { NowRequest, NowResponse } from '@now/node'
import prisma from "../src/lib/api/prisma";
import {authMiddleware} from "../src/lib/api/auth";
import {Token} from "../src/lib/didManager";

export default authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  const userData = {
    ethAddress: token.claim.iss.toLowerCase(),
  };

  let user = await prisma.user.findUnique({
    where: userData,
  });

  if(!user) {
    user = await prisma.user.create({
      data: userData,
    });
  }

  res.json(user)
});
