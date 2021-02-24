import { StatusCodes } from 'http-status-codes';
import { NowRequest, NowResponse } from '@now/node'
import {BityOrderError} from "../wrappers/bityTypes";
import {APIError} from "../errors";

type Handler = (req: NowRequest, res: NowResponse) => Promise<NowResponse | void>

export const errorMiddleware = (fn: Handler): Handler => async (req: NowRequest, res: NowResponse) => {
  try {

    return await fn(req, res)

  } catch(error) {
    if(error instanceof BityOrderError || error instanceof APIError) {
      return res.status(error.code).json(error.toObject());
    } else {
      console.error(error);
      if(error.code === 'ECONNABORTED') {
        const timeout = new APIError(StatusCodes.REQUEST_TIMEOUT, 'timeout', error.request?._currentUrl);
        return res.status(timeout.code).json(timeout.toObject());
      }
      const unexpected = new APIError(StatusCodes.INTERNAL_SERVER_ERROR, 'unexpected-error');
      return res.status(unexpected.code).json(unexpected.toObject());
    }
  }
};
