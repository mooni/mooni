import { NowRequest, NowResponse } from '@now/node'
import { APIError } from '../errors';
import config from '../../config';

function getHeaderToken(req: NowRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  if (token.length === 0) return null;
  return token;
}

type Handler = (req: NowRequest, res: NowResponse) => Promise<NowResponse | void>

export const adminMiddleware = (fn: Handler): Handler => async (req: NowRequest, res: NowResponse) => {
  if(!config.private.adminToken) {
    throw new APIError(500, 'unavailable');
  }
  const adminToken = getHeaderToken(req);
  if(!adminToken || config.private.adminToken !== adminToken) {
    throw new APIError(401, 'not-authorized');
  }
  return await fn(req, res);
};
