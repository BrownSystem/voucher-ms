/*
  Warnings:

  - You are about to drop the `_VoucherProducts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_VoucherProducts" DROP CONSTRAINT "_VoucherProducts_A_fkey";

-- DropForeignKey
ALTER TABLE "_VoucherProducts" DROP CONSTRAINT "_VoucherProducts_B_fkey";

-- AlterTable
ALTER TABLE "EVoucherProduct" ALTER COLUMN "voucherId" DROP NOT NULL;

-- DropTable
DROP TABLE "_VoucherProducts";

-- AddForeignKey
ALTER TABLE "EVoucherProduct" ADD CONSTRAINT "EVoucherProduct_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "EVoucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
