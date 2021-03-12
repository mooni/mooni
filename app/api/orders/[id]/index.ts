import { NowRequest, NowResponse } from '@now/node'

import { Token } from '../../../src/lib/didManager'
import { authMiddleware, errorMiddleware } from '../../../apiLib/middlewares'
import { OrderStatus } from '../../../apiLib/prisma'
import { APIError } from '../../../src/lib/errors'
import Bity from '../../../src/lib/wrappers/bity'
import config from '../../../src/config'
import { getOrder, cancelOrder, updateStatusFromBity } from '../../../apiLib/orders'

const EXPIRATION = 8 * 60 * 1000 // 8 minutes

// Get order
export default errorMiddleware(
  authMiddleware(
    async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
      const id = req.query?.id as string
      if (!id) {
        throw new APIError(400, 'wrong-body', 'multiTradeRequest values are invalid')
      }
      const mooniOrder = await getOrder(id, token.claim.iss)

      if (mooniOrder.status === OrderStatus.PENDING) {
        const now = new Date()
        if (+now - +mooniOrder.createdAt > EXPIRATION) {
          const bityInstance = new Bity()
          await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret)

          await cancelOrder(bityInstance, mooniOrder)
          const updatedMooniOrder = await getOrder(id, token.claim.iss)
          return res.json(updatedMooniOrder)
        }
      }
      if (mooniOrder.status === OrderStatus.PAID) {
        const bityInstance = new Bity()
        await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret)

        await updateStatusFromBity(bityInstance, mooniOrder)
        const updatedMooniOrder = await getOrder(id, token.claim.iss)
        return res.json(updatedMooniOrder)
      }

      return res.json(mooniOrder)
    }
  )
)
