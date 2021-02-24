import prisma, { MooniOrder, OrderStatus } from './prisma';

import Bity from '../src/lib/wrappers/bity';
import {APIError} from '../src/lib/errors';
import { BityOrderError, BityOrderResponse, BityOrderStatus } from '../src/lib/wrappers/bityTypes';
import { compareAddresses } from './ethHelpers';

export async function getOrder(id: string, userAddress: string): Promise<MooniOrder> {
  const mooniOrder = await prisma.mooniOrder.findUnique({
    where: { id },
  });
  if(!mooniOrder || !compareAddresses(mooniOrder.ethAddress, userAddress)) {
    throw new APIError(404, 'not-found', 'MooniOrder not found');
  }
  return mooniOrder;
}

export async function getBityOrder(bityInstance: Bity, mooniOrder: MooniOrder): Promise<BityOrderResponse> {
  const { bityOrderId } = mooniOrder;
  if(!bityOrderId) {
    throw new APIError(400, 'invalid-order', 'no bityOrderId present');
  }

  return bityInstance.getOrderDetails(bityOrderId);
}

export async function updateStatusFromBity(bityInstance: Bity, mooniOrder: MooniOrder): Promise<void> {
  const bityOrderDetails = await getBityOrder(bityInstance, mooniOrder);

  if(bityOrderDetails.orderStatus === BityOrderStatus.EXECUTED) {
    await prisma.mooniOrder.update({
      where: { id: mooniOrder.id },
      data: {
        status: OrderStatus.EXECUTED,
        executedAt: bityOrderDetails.timestamp_executed,
      },
    });
  } else if(bityOrderDetails.orderStatus === BityOrderStatus.CANCELLED) {
    await prisma.mooniOrder.update({
      where: { id: mooniOrder.id },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });
  }
}

export async function cancelOrder(bityInstance: Bity, mooniOrder: MooniOrder) {
  const { bityOrderId } = mooniOrder;
  if(!bityOrderId) {
    throw new APIError(400, 'invalid-order', 'no bityOrderId present');
  }

  try {
    await bityInstance.cancelOrder(bityOrderId);
    await prisma.mooniOrder.update({
      where: { id: mooniOrder.id },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });
  } catch(error) {
    if(error instanceof BityOrderError && error.meta?.errors[0]?.code === 'order_is_cancelled') {}
    else {
      throw error;
    }
  }
  await prisma.mooniOrder.update({
    where: { id: mooniOrder.id },
    data: {
      status: OrderStatus.CANCELLED,
    },
  });
}