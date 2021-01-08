import { PrismaClient } from '../../../app/node_modules/.prisma/client'
import {BityOrderResponse} from "../../../app/src/lib/wrappers/bityTypes"
import {MooniOrderStatus} from "../../../app/src/types/api"

import {readJSON} from "./utils"

const prisma = new PrismaClient()

async function createMooniOrder(bityOrder: BityOrderResponse) {
  const rawMooniOrder = {
    createdAt: bityOrder.timestamp_created,
    executedAt: bityOrder.timestamp_executed,
    inputAmount: bityOrder.input.amount,
    outputAmount: bityOrder.output.amount,
    inputCurrency: bityOrder.input.currency,
    outputCurrency: bityOrder.output.currency,
    bityOrderId: bityOrder.id,
    ethAmount: bityOrder.input.amount,
    status: 'EXECUTED' as MooniOrderStatus,
    user: {
      connectOrCreate: {
        where: { ethAddress: bityOrder.input.crypto_address },
        create: { ethAddress: bityOrder.input.crypto_address },
      },
    },
  }

  await prisma.mooniOrder.create({
    data: rawMooniOrder,
  })
}

async function run() {

  const orders = readJSON('./output/orders.json')

  for(let year of Object.keys(orders)) {
    const yearOrders = orders[year]
    for(let month of Object.keys(yearOrders)) {
      const monthOrders = Object.values(yearOrders[month]) as BityOrderResponse[]
      for(let order of monthOrders) {
        if(order.input) {
          console.log(order.id)
          await createMooniOrder(order).catch(error => {
            if(error.code === 'P2002') return
            throw error
          })
        }
      }
    }
  }

}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
