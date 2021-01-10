import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/wrappers/bity';
import {TradeRequest} from "../../src/lib/trading/types";
import { Trader } from "../../src/lib/trading/trader";
import {APIError} from "../../src/lib/errors";
import {errorMiddleware} from "../../src/lib/api/errorMiddleware";
import CurrenciesManager from '../../src/lib/trading/currenciesManager';

const bityInstance = new Bity();

export default errorMiddleware(async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {

  const tradeRequest = req.body as TradeRequest;

  // TODO validate
  if(!tradeRequest) {
    throw new APIError(400, 'wrong-body', 'tradeRequest values are invalid');
  }

  const currenciesManager = new CurrenciesManager();
  await currenciesManager.fetchCurrencies();
  const trader = new Trader(bityInstance, currenciesManager);

  const multiTrade = await trader.estimateMultiTrade(tradeRequest);

  return res.json(multiTrade);

})
