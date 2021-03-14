import { NowRequest, NowResponse } from '@now/node'

import { errorMiddleware } from '../../apiLib/middlewares'
import { getUserByReferral } from '../../apiLib/users'
import { APIError } from '../../src/lib/errors';
import { assertMethod } from '../../apiLib/validator';

export default errorMiddleware(
  async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {
    assertMethod(req, 'POST');

    const { referralId } = req.body
    if (!referralId) {
      throw new APIError(400, 'wrong-body', 'referralId is required')
    }

    const referredUser = await getUserByReferral(referralId)
    return res.json({ valid: !!referredUser })
  }
)
