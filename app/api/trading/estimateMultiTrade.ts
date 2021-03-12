import { NowRequest, NowResponse } from '@now/node'

import Bity from '../../src/lib/wrappers/bity'
import { TradeRequest } from '../../src/lib/trading/types'
import { Trader } from '../../src/lib/trading/trader'
import { APIError, MetaError } from '../../src/lib/errors'
import { errorMiddleware } from '../../apiLib/middlewares/errorMiddleware'

const bityInstance = new Bity()

export default errorMiddleware(
  async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {
    const tradeRequest = req.body as TradeRequest

    // TODO validate
    if (!tradeRequest) {
      throw new APIError(400, 'wrong-body', 'tradeRequest values are invalid')
    }

    const trader = new Trader(bityInstance)

    try {
      const multiTrade = await trader.estimateMultiTrade(tradeRequest)
      return res.json(multiTrade)
    } catch (error) {
      if (error instanceof MetaError && error.message === 'dex-liquidity-error') {
        throw new APIError(417, 'dex-liquidity-error', 'not enough liquidity for token', error.meta)
      } else {
        throw error
      }
    }
  }
)
