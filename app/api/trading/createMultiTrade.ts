import {NowRequest, NowResponse} from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import {BityTrade, MultiTrade, MultiTradeRequest, TradeType} from "../../src/lib/trading/types";
import {Trader} from "../../src/lib/trading/trader";
import {Token} from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/auth";
import prisma from '../../src/lib/api/prisma'
import {getUser, getUserByReferal} from "../../src/lib/api/users";

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

export default authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  if(!req.body) {
    res.status(400).send('no body');
    return;
  }

  const multiTradeRequest = req.body as MultiTradeRequest;

  // TODO validate
  if(!multiTradeRequest) {
    return res.status(400).send('wrong body');
  }
  if(multiTradeRequest.ethInfo.fromAddress.toLowerCase() !== token.claim.iss.toLowerCase()) {
    return res.status(400).send('different ethereum address used for order and authentication');
  }

  try {

    if(multiTradeRequest.referalId) {
      const user = await getUser(token.claim.iss);
      if(multiTradeRequest.referalId === user.referalId) {
        throw new Error('self-referal');
      }
      const referedUser = await getUserByReferal(multiTradeRequest.referalId);
      if(!referedUser) {
        throw new Error('unknown-referal');
      }
    }

    await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);
    const trader = new Trader(bityInstance);

    await Trader.assertTokenReady(multiTradeRequest.tradeRequest);

    const multiTrade = await trader.createMultiTrade(multiTradeRequest);

    await createMooniOrder(multiTrade);

    return res.json(multiTrade)

  } catch(error) {
    if(error._bityError) {
      return res.status(400).json({
        message: error.message,
        _bityError: error._bityError,
        errors: error.errors
      });
    } else if(error.message === 'self-referal') {
      return res.status(400).json({ // TODO handle this in frontend
        message: 'self-referal',
        description: 'you cannot create an order by referring yourself',
      });
    } else if(error.message === 'unknown-referal') {
      return res.status(400).json({
        message: 'unknown-referal',
        description: 'The provided referalId is not found',
      });
    } else {  // TODO
      console.log(error);
      return res.status(500).send('Unexpected server error');
    }
  }

})
