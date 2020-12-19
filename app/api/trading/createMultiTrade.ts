import {NowRequest, NowResponse} from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import {BityTrade, MultiTrade, MultiTradeRequest, TradeType} from "../../src/lib/trading/types";
import {Trader} from "../../src/lib/trading/trader";
import {Token} from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/authMiddleware";
import {errorMiddleware} from "../../src/lib/api/errorMiddleware";
import prisma from '../../src/lib/api/prisma'
import {getUser, getUserByReferal} from "../../src/lib/api/users";
import {APIError} from "../../src/lib/errors";

const bityInstance = new Bity();

async function createMooniOrder(multiTrade: MultiTrade) {
  const bityTrade = multiTrade.trades.find(t => t.tradeType === TradeType.BITY);
  const bityOrderId = bityTrade && (bityTrade as BityTrade).bityOrderResponse.id;

  const ethAddress = multiTrade.ethInfo.fromAddress.toLowerCase();

  const rawMooniOrder = {
    inputAmount: multiTrade.inputAmount,
    outputAmount: multiTrade.outputAmount,
    inputCurrency: multiTrade.tradeRequest.inputCurrencySymbol,
    outputCurrency: multiTrade.tradeRequest.outputCurrencySymbol,
    bityOrderId,
    ethAmount: multiTrade.ethAmount,
    user: {
      connectOrCreate: {
        where: { ethAddress },
        create: { ethAddress },
      },
    },
    referalUser: (
      multiTrade.referalId ?
        {
          connect: {
            referalId: multiTrade.referalId,
          },
        }
        :
        undefined
    ),
  };

  await prisma.mooniOrder.create({
    data: rawMooniOrder,
  });
}

export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {

  const multiTradeRequest = req.body as MultiTradeRequest;

  // TODO validate
  if(!multiTradeRequest) {
    throw new APIError(400, 'wrong-body', 'multiTradeRequest values are invalid');
  }
  if(multiTradeRequest.ethInfo.fromAddress.toLowerCase() !== token.claim.iss.toLowerCase()) {
    throw new APIError(400, 'different-addresses', 'different ethereum address used for order and authentication');
  }

  if(multiTradeRequest.referalId) {
    const user = await getUser(token.claim.iss);
    if(multiTradeRequest.referalId === user.referalId) {
      throw new APIError(400, 'self-referal', 'you cannot create an order by referring yourself');
    }
    const referedUser = await getUserByReferal(multiTradeRequest.referalId);
    if(!referedUser) {
      throw new APIError(400, 'unknown-referal', 'The provided referalId is not found');
    }
  }

  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);
  const trader = new Trader(bityInstance);

  await Trader.assertTokenReady(multiTradeRequest.tradeRequest);

  const multiTrade = await trader.createMultiTrade(multiTradeRequest);

  await createMooniOrder(multiTrade);

  return res.json(multiTrade)

}))
