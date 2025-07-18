/*
  Warnings:

  - The values [DOLAR,MERCADO_PAGO,OTRO] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `currency` to the `EVoucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainingAmount` to the `EVoucher` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `number` on the `EVoucher` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `price` to the `EVoucherProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `EVoucherProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('EFECTIVO', 'CHEQUE', 'TRANSFERENCIA', 'TARJETA');
ALTER TABLE "EPayment" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "EPayment" ADD COLUMN     "bankId" TEXT,
ADD COLUMN     "chequeDueDate" TIMESTAMP(3),
ADD COLUMN     "chequeNumber" TEXT,
ADD COLUMN     "chequeStatus" TEXT,
ADD COLUMN     "exchangeRate" DOUBLE PRECISION,
ADD COLUMN     "originalAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "EVoucher" ADD COLUMN     "currency" "Currency" NOT NULL,
ADD COLUMN     "deliveredBy" TEXT,
ADD COLUMN     "emittedBy" TEXT,
ADD COLUMN     "exchangeRate" DOUBLE PRECISION,
ADD COLUMN     "financialStatus" TEXT,
ADD COLUMN     "logisticStatus" TEXT,
ADD COLUMN     "remainingAmount" DOUBLE PRECISION NOT NULL,
DROP COLUMN "number",
ADD COLUMN     "number" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "EVoucherProduct" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "EBank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT,
    "account" TEXT,
    "cbu" TEXT,
    "alias" TEXT,
    "currency" "Currency" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountType" TEXT,
    "bankCode" TEXT,
    "swiftCode" TEXT,
    "holderName" TEXT,
    "holderDoc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EBank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EBank_name_currency_idx" ON "EBank"("name", "currency");

-- CreateIndex
CREATE INDEX "EBank_cbu_idx" ON "EBank"("cbu");

-- CreateIndex
CREATE INDEX "EBank_alias_idx" ON "EBank"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "EVoucher_number_key" ON "EVoucher"("number");

-- AddForeignKey
ALTER TABLE "EPayment" ADD CONSTRAINT "EPayment_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "EBank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
