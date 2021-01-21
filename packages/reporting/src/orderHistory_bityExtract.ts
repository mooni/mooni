import { PrismaClient } from '../../../app/node_modules/.prisma/client'
import {MooniOrderStatus} from "../../../app/src/types/api"
import { AssetTransfersCategory, createAlchemyWeb3 } from '@alch/alchemy-web3';

import {readJSON} from "./utils"

const prisma = new PrismaClient()
const web3 = createAlchemyWeb3("https://eth-mainnet.alchemyapi.io/v2/demo");

interface BityOrderExtract {
  id: string;
  input: {
    amount: string;
    currency: string;
  }
  output: {
    amount: string;
    currency: string;
  }
  timestamp_executed: string;
  crypto_address: string;
  tx_hash?: string;
}

async function fetchOrderTx(bityOrder: BityOrderExtract) {
  const mooniOrder = await prisma.mooniOrder.findUnique({
    where: { bityOrderId: bityOrder.id },
  });
  if(!mooniOrder) throw new Error('mooniorder not found');
  if(mooniOrder.txHash) return;

  if(bityOrder.tx_hash) {
    await prisma.mooniOrder.update({
      where: { bityOrderId: bityOrder.id },
      data: { txHash: bityOrder.tx_hash },
    });
    return;
  }

  const transfers = await web3.alchemy.getAssetTransfers({
    fromBlock: web3.utils.numberToHex(10220000),
    fromAddress: mooniOrder.ethAddress,
    category: [AssetTransfersCategory.EXTERNAL],
  });
  const transfer = transfers.transfers.find(t =>
  String(t.value).substr(0, 8) === bityOrder.input.amount.substr(0, 8)
  );
  if(!transfer) {
    throw new Error('cannot find transfer')
  }
  const { hash: txHash } = transfer;

  await prisma.mooniOrder.update({
    where: { bityOrderId: bityOrder.id },
    data: { txHash },
  });

}

async function createMooniOrder(bityOrder: BityOrderExtract) {
  const mooniOrder = await prisma.mooniOrder.findUnique({
    where: { bityOrderId: bityOrder.id },
  });
  if(mooniOrder) return;

  const date = `${bityOrder.timestamp_executed}.000Z`
  const rawMooniOrder = {
    createdAt: date,
    executedAt: date,
    inputAmount: bityOrder.input.amount,
    outputAmount: bityOrder.output.amount,
    inputCurrency: bityOrder.input.currency,
    outputCurrency: bityOrder.output.currency,
    bityOrderId: bityOrder.id,
    ethAmount: bityOrder.input.amount,
    status: 'EXECUTED' as MooniOrderStatus,
    user: {
      connectOrCreate: {
        where: { ethAddress: bityOrder.crypto_address },
        create: { ethAddress: bityOrder.crypto_address },
      },
    },
  }

  await prisma.mooniOrder.create({
    data: rawMooniOrder,
  })
}

async function run() {

  const orders = readJSON('./output/bity_orders_extract.json')

  for(let order of orders as any[]) {
    console.log(order.id)
    await createMooniOrder(order)
    await fetchOrderTx(order);
  }

}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
