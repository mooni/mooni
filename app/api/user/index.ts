import { NowRequest, NowResponse } from '@now/node'
import {authMiddleware} from "../../src/lib/api/authMiddleware";
import {Token} from "../../src/lib/didManager";
import {getUser} from "../../src/lib/api/users";
import { errorMiddleware } from '../../src/lib/api/errorMiddleware';

export default errorMiddleware(authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  res.json(await getUser(token.claim.iss))
}));
