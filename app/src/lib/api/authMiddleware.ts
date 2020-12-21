import { NowRequest, NowResponse } from '@now/node'
import DIDManager, {Token} from "../didManager";

function getHeaderToken(req: NowRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  if (token.length === 0) return null;
  return token;
}

type Handler = (req: NowRequest, res: NowResponse) => Promise<NowResponse | void>
type AuthedHandler = (req: NowRequest, res: NowResponse, token: Token) => Promise<NowResponse | void>

export const authMiddleware = (fn: AuthedHandler): Handler => async (req: NowRequest, res: NowResponse) => {
  const jwsToken = getHeaderToken(req);
  if(!jwsToken) {
    return res.status(401).send('authorization required');
  }
  let token;
  try {
    token = DIDManager.decodeToken(jwsToken);
  } catch(error) {
    return res.status(401).send(`invalid token: ${error.message}`);
  }
  return await fn(req, res, token)
};
