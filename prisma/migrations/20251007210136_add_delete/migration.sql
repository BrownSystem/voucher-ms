-- AlterTable
ALTER TABLE "ECheckBook" ADD COLUMN     "chequeBank" TEXT,
ADD COLUMN     "chequeDueDate" TIMESTAMP(3),
ADD COLUMN     "chequeNumber" TEXT,
ADD COLUMN     "chequeReceived" TIMESTAMP(3),
ALTER COLUMN "branchId" DROP NOT NULL;
