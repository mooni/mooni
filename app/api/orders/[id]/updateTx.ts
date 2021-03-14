import { NowRequest, NowResponse } from '@now/node'

import { Token } from '../../../src/lib/didManager'
import { authMiddleware, errorMiddleware } from '../../../apiLib/middlewares'
import prisma, { OrderStatus } from '../../../apiLib/prisma'
import { APIError } from '../../../src/lib/errors'
import { getOrder } from '../../../apiLib/orders'
import { assertMethod } from '../../../apiLib/validator';

export default errorMiddleware(
  authMiddleware(
    async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
      assertMethod(req, 'POST');
      const multiTradeId = req.query?.id as string
      const txHash = req.body?.txHash as string

      if (!multiTradeId || !txHash) {
        throw new APIError(400, 'wrong-body', '[multiTradeId, txHash] required')
      }

      const mooniOrder = await getOrder(multiTradeId, token.claim.iss)
      if (mooniOrder.txHash || mooniOrder.status !== OrderStatus.PENDING) {
        throw new APIError(400, 'invalid', 'Order already has a txHash set')
      }

      await prisma.mooniOrder.update({
        where: { id: multiTradeId },
        data: {
          txHash,
          status: OrderStatus.PAID,
        },
      })

      res.json({ message: 'ok' })
    }
  )
)
