import { NowRequest, NowResponse } from '@now/node'
import prisma, { OrderStatus } from "../../src/lib/api/prisma";
import { adminMiddleware } from '../../src/lib/api/adminMiddleware';
import { errorMiddleware } from '../../src/lib/api/errorMiddleware';
import { cancelOrder } from '../orders/[id]/cancel';
import Bity from '../../src/lib/wrappers/bity';
import config from '../../src/config';

const EXPIRATION = 20*60*1000; // 20 minutes

// Fetch stalled orders
export default errorMiddleware(adminMiddleware(async (req: NowRequest, res: NowResponse): Promise<NowResponse | void> => {
  const orders = await prisma.mooniOrder.findMany({
    where: {
      status: OrderStatus.PENDING,
    },
  });
  const now = new Date();

  const bityInstance = new Bity();
  await bityInstance.initializeAuth(config.private.bityClientId, config.private.bityClientSecret);

  for(let order of orders) {
    if((+now - +order.createdAt) > EXPIRATION) {
      await cancelOrder(bityInstance, order);
    }
  }

  res.json({ message: 'ok' });
}));
