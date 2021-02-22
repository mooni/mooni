import { NowRequest, NowResponse } from '@now/node'
import {authMiddleware} from "../src/lib/api/authMiddleware";
import {Token} from "../src/lib/didManager";
import {getUser} from "../src/lib/api/users";
import { errorMiddleware } from '../src/lib/api/errorMiddleware';
import prisma from '../src/lib/api/prisma';
import { BN } from '../src/lib/numbers';
import { ProfitShare } from '../src/types/api';
import config from '../src/config';

export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  const user = await getUser(token.claim.iss);

  const { referralId } = user;
  const aggregateReferral = await prisma.$queryRaw<any>(`
    SELECT 
      SUM(CAST("ethAmount" AS numeric)) AS "totalETH",
      COUNT(*)
    FROM "MooniOrder"
    WHERE "referralId" = '${referralId}';
  `);

  const referralProfit = new BN(aggregateReferral[0].totalETH || 0).times(config.private.bityPartnerFee).times(config.referralSharing).toFixed();

  const data: ProfitShare = {
    referralTxCount: aggregateReferral[0].count,
    referralProfit,
  };

  res.json(data);
}));
