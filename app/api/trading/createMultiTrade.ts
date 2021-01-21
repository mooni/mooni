import {NowRequest, NowResponse} from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import { BityTrade, MultiTrade, MultiTradeRequest, MultiTradeTemp, TradeType } from '../../src/lib/trading/types';
import {Trader} from "../../src/lib/trading/trader";
import {Token} from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/authMiddleware";
import {errorMiddleware} from "../../src/lib/api/errorMiddleware";
import prisma from '../../src/lib/api/prisma'
import {getUser, getUserByReferral} from "../../src/lib/api/users";
import {APIError} from "../../src/lib/errors";
import CurrenciesManager from '../../src/lib/trading/currenciesManager';
import { compareAddresses } from '../../src/lib/api/ethHelpers';

const bityInstance = new Bity();

async function createMooniOrder(multiTradeTemp: MultiTradeTemp) {
  const bityTrade = multiTradeTemp.trades.find(t => t.tradeType === TradeType.BITY);
  const bityOrderId = bityTrade && (bityTrade as BityTrade).bityOrderResponse.id;

  const ethAddress = multiTradeTemp.ethInfo.fromAddress.toLowerCase();

  const rawMooniOrder = {
    inputAmount: multiTradeTemp.inputAmount,
    outputAmount: multiTradeTemp.outputAmount,
    inputCurrency: multiTradeTemp.tradeRequest.inputCurrencySymbol,
    outputCurrency: multiTradeTemp.tradeRequest.outputCurrencySymbol,
    bityOrderId,
    ethAmount: multiTradeTemp.ethAmount,
    user: {
      connectOrCreate: {
        where: { ethAddress },
        create: { ethAddress },
      },
    },
    referralUser: (
      multiTradeTemp.referralId ?
        {
          connect: {
            referralId: multiTradeTemp.referralId,
          },
        }
        :
        undefined
    ),
  };

  return prisma.mooniOrder.create({
    data: rawMooniOrder,
  });
}

export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {

  const multiTradeRequest = req.body as MultiTradeRequest;

  // TODO validate
  if(!multiTradeRequest) {
    throw new APIError(400, 'wrong-body', 'multiTradeRequest values are invalid');
  }
  if(!compareAddresses(multiTradeRequest.ethInfo.fromAddress, token.claim.iss)) {
    throw new APIError(400, 'different-addresses', 'different ethereum address used for order and authentication');
  }

  if(multiTradeRequest.referralId) {
    const user = await getUser(token.claim.iss);
    if(multiTradeRequest.referralId === user.referralId) {
      throw new APIError(400, 'self-referral', 'you cannot create an order by referring yourself');
    }
    const referredUser = await getUserByReferral(multiTradeRequest.referralId);
    if(!referredUser) {
      throw new APIError(400, 'unknown-referral', 'The provided referralId is not found');
    }
  }

  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  const currenciesManager = new CurrenciesManager();
  await currenciesManager.fetchCurrencies();
  const trader = new Trader(bityInstance, currenciesManager);

  const multiTradeTemp = await trader.createMultiTrade(multiTradeRequest);

  const { id } = await createMooniOrder(multiTradeTemp);

  const multiTrade: MultiTrade = {
    ...multiTradeTemp,
    id,
  }
  return res.json(multiTrade)

}))
