/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[txHash]` on the table `MooniOrder`. If there are existing duplicate values, the migration will fail.

*/
-- AlterTable
ALTER TABLE "MooniOrder" ADD COLUMN     "txHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MooniOrder.txHash_unique" ON "MooniOrder"("txHash");
