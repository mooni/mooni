import { NowRequest, NowResponse } from '@now/node'
import {authMiddleware} from "../../apiLib/middlewares/authMiddleware";
import {Token} from "../../src/lib/didManager";
import {getUser} from "../../apiLib/users";
import { errorMiddleware } from '../../apiLib/middlewares/errorMiddleware';

export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  res.json(await getUser(token.claim.iss))
}));
