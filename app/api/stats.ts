import { NowRequest, NowResponse } from '@now/node'
import prisma from "../src/lib/api/prisma";
import { Stats } from '../src/types/api';

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {
  const aggregateETH = await prisma.$queryRaw<any>(`
    SELECT 
      SUM(CAST("ethAmount" AS numeric)) AS "totalETH",
      COUNT(*)
    FROM "MooniOrder"
    WHERE status = 'EXECUTED';
  `);

  const aggregateOutput = await prisma.$queryRaw<any>(`
    SELECT 
      SUM(CAST("outputAmount" AS numeric)) as "totalOutput",
      "outputCurrency"
    FROM "MooniOrder"
    WHERE status = 'EXECUTED'
    GROUP BY "outputCurrency"
  `);

  const stats: Stats = {
    ordersCount: aggregateETH[0].count,
    totalETH: aggregateETH[0].totalETH,
    totalEUR: aggregateOutput.find(a => a.outputCurrency === 'EUR').totalOutput,
    totalCHF: aggregateOutput.find(a => a.outputCurrency === 'CHF').totalOutput,
  };

  res.json(stats);
};
