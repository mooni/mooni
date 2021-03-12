import { NowRequest, NowResponse } from '@now/node'

import { errorMiddleware } from '../../apiLib/middlewares'
import { getUserByReferral } from '../../apiLib/users'

export default errorMiddleware(
  async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {
    const { referralId } = req.body

    const referredUser = await getUserByReferral(referralId)
    return res.json({ valid: !!referredUser })
  }
)
