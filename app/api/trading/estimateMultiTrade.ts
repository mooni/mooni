import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import {TradeRequest} from "../../src/lib/trading/types";
import { Trader } from "../../src/lib/trading/trader";

const bityInstance = new Bity();

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {
  if(!req.body) {
    res.status(400).send('no body');
    return;
  }

  const tradeRequest = req.body as TradeRequest;

  // TODO validate
  if(!tradeRequest) {
    return res.status(400).send('wrong body');
  }

  const trader = new Trader(bityInstance);

  try {
    await Trader.assertTokenReady(tradeRequest);

    const multiTrade = await trader.estimateMultiTrade(tradeRequest);

    return res.json(multiTrade);

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

}
