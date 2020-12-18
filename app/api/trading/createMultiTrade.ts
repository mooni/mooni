import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import {MultiTradeRequest} from "../../src/lib/trading/types";
import { Trader } from "../../src/lib/trading/trader";
import { Token } from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/auth";
import {BityOrderError} from "../../src/lib/wrappers/bityTypes";

const bityInstance = new Bity();

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
    return res.json(multiTrade)
  } catch(error) {
    if(error instanceof BityOrderError) {
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
