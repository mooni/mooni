import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';
import {MultiTradeRequest} from "../../src/lib/trading/types";
import { Trader } from "../../src/lib/trading/trader";
import { Token } from "../../src/lib/didManager";
import {authMiddleware} from "../../src/lib/api/auth";

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
    const multiTrade = await trader.createMultiTrade(multiTradeRequest);
    return res.json(multiTrade)
  } catch(error) {
    if(error._orderError) { // TODO
      return res.status(400).json({
        message: error.message,
        _orderError: error._orderError,
        errors: error.errors
      });
    } else {
      console.log(error);
      return res.status(500).send('Unexpected server error');
    }
  }

})
