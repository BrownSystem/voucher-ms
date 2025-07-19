/*
  Warnings:

  - You are about to drop the column `reservation` on the `EVoucherProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EVoucherProduct" DROP COLUMN "reservation",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "isReserved" BOOLEAN NOT NULL DEFAULT false;
