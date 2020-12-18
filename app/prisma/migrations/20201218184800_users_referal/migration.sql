-- AlterTable
ALTER TABLE "MooniOrder" ADD COLUMN     "referalId" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ethAddress" TEXT NOT NULL,
    "referalId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.ethAddress_unique" ON "User"("ethAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User.referalId_unique" ON "User"("referalId");

-- AddForeignKey
ALTER TABLE "MooniOrder" ADD FOREIGN KEY("ethAddress")REFERENCES "User"("ethAddress") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MooniOrder" ADD FOREIGN KEY("referalId")REFERENCES "User"("referalId") ON DELETE SET NULL ON UPDATE CASCADE;
