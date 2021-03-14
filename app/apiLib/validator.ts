import { APIError } from '../src/lib/errors';
import { NowRequest } from '@now/node';

export function assertMethod(req: NowRequest, method: string) {
  if(req.method !== method) {
    throw new APIError(400, 'wrong-method', 'Wrong HTTP method', {expectedMethod: method})
  }
}
