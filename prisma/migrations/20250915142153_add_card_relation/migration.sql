-- AlterTable
ALTER TABLE "EPayment" ADD COLUMN     "cardId" TEXT;

-- CreateTable
CREATE TABLE "_CardPayments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CardPayments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CardPayments_B_index" ON "_CardPayments"("B");

-- AddForeignKey
ALTER TABLE "_CardPayments" ADD CONSTRAINT "_CardPayments_A_fkey" FOREIGN KEY ("A") REFERENCES "ECard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardPayments" ADD CONSTRAINT "_CardPayments_B_fkey" FOREIGN KEY ("B") REFERENCES "EPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
