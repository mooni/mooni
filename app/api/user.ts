import { NowRequest, NowResponse } from '@now/node'
import {authMiddleware} from "../src/lib/api/authMiddleware";
import {Token} from "../src/lib/didManager";
import {getUser} from "../src/lib/api/users";

export default authMiddleware(async (req: NowRequest, res: NowResponse, token: Token): Promise<NowResponse | void> => {
  res.json(await getUser(token.claim.iss))
});
