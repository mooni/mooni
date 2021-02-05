import { NowRequest, NowResponse } from '@now/node'
import {BityOrderError} from "../wrappers/bityTypes";
import {APIError} from "../errors";

type Handler = (req: NowRequest, res: NowResponse) => Promise<NowResponse | void>

export const errorMiddleware = (fn: Handler): Handler => async (req: NowRequest, res: NowResponse) => {
  try {

    return await fn(req, res)

  } catch(error) {
    if(error instanceof BityOrderError || error instanceof APIError) {
      return res.status(error.code).json(error.toObject());
    } else {
      console.error(error);
      const unexpected = new APIError(500, 'unexpected-error');
      return res.status(unexpected.code).json(unexpected.toObject());
    }
  }
};
