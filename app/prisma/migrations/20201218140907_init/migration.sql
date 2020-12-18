-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'EXECUTED');

-- CreateTable
CREATE TABLE "MooniOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL DEFAULT E'PENDING',
    "ethAddress" TEXT NOT NULL,
    "inputAmount" TEXT NOT NULL,
    "inputCurrency" TEXT NOT NULL,
    "outputAmount" TEXT NOT NULL,
    "outputCurrency" TEXT NOT NULL,
    "ethAmount" TEXT NOT NULL,
    "bityOrderId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MooniOrder.bityOrderId_unique" ON "MooniOrder"("bityOrderId");
