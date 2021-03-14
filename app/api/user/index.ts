import { NowRequest, NowResponse } from '@now/node'
import { authMiddleware, errorMiddleware } from '../../apiLib/middlewares'
import { Token } from '../../src/lib/didManager'
import { getUser } from '../../apiLib/users'

export default errorMiddleware(
  authMiddleware(
    async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
      res.json(await getUser(token.claim.iss))
    }
  )
)
