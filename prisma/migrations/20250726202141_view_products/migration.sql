-- DropForeignKey
ALTER TABLE "EVoucherProduct" DROP CONSTRAINT "EVoucherProduct_voucherId_fkey";

-- CreateTable
CREATE TABLE "_VoucherProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_VoucherProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_VoucherProducts_B_index" ON "_VoucherProducts"("B");

-- AddForeignKey
ALTER TABLE "_VoucherProducts" ADD CONSTRAINT "_VoucherProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "EVoucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VoucherProducts" ADD CONSTRAINT "_VoucherProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "EVoucherProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
