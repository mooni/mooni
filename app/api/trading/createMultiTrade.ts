import {NowRequest, NowResponse} from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import {BityTrade, MultiTrade, MultiTradeRequest, TradeType} from "../../src/lib/trading/types";
import {Trader} from "../../src/lib/trading/trader";
import {Token} from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/auth";
import prisma from '../../src/lib/api/prisma'

const bityInstance = new Bity();

async function createMooniOrder(multiTrade: MultiTrade) {
  const bityTrade = multiTrade.trades.find(t => t.tradeType === TradeType.BITY);
  const bityOrderId = bityTrade && (bityTrade as BityTrade).bityOrderResponse.id;

  const rawMooniOrder = {
    ethAddress: multiTrade.ethInfo.fromAddress.toLowerCase(),
    inputAmount: multiTrade.inputAmount,
    outputAmount: multiTrade.outputAmount,
    inputCurrency: multiTrade.tradeRequest.inputCurrencySymbol,
    outputCurrency: multiTrade.tradeRequest.outputCurrencySymbol,
    bityOrderId,
    ethAmount: multiTrade.ethAmount,
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

  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);
  const trader = new Trader(bityInstance);

  try {

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
    } else {  // TODO
      console.log(error);
      return res.status(500).send('Unexpected server error');
    }
  }

})
