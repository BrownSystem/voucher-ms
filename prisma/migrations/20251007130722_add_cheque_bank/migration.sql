-- AlterTable
ALTER TABLE "EPayment" ADD COLUMN     "chequeBank" TEXT,
ADD COLUMN     "chequeReceived" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ECheckBook" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ECheckBook_pkey" PRIMARY KEY ("id")
);
