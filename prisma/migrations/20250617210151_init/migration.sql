-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('FACTURA', 'REMITO', 'NOTA_CREDITO', 'P');

-- CreateEnum
CREATE TYPE "ConditionPayment" AS ENUM ('CASH', 'CREDIT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'DOLAR', 'CHEQUE', 'TRANSFERENCIA', 'TARJETA', 'MERCADO_PAGO', 'OTRO');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('PENDIENTE', 'PAGADO', 'CANCELADO', 'ENTREGADO', 'RESERVADO');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('ARS', 'USD', 'EUR');

-- CreateTable
CREATE TABLE "EVoucher" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "letter" TEXT,
    "type" "VoucherType" NOT NULL,
    "emissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "emissionBranchId" TEXT,
    "emissionBranchName" TEXT,
    "destinationBranchId" TEXT,
    "status" "VoucherStatus" NOT NULL DEFAULT 'PENDIENTE',
    "contactId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "conditionPayment" "ConditionPayment",
    "totalAmount" DOUBLE PRECISION,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observation" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "EVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EVoucherProduct" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "EVoucherProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EPayment" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EVoucher_number_key" ON "EVoucher"("number");

-- CreateIndex
CREATE INDEX "EVoucher_type_emissionDate_idx" ON "EVoucher"("type", "emissionDate");

-- CreateIndex
CREATE INDEX "EVoucher_contactId_status_idx" ON "EVoucher"("contactId", "status");

-- CreateIndex
CREATE INDEX "EVoucherProduct_voucherId_productId_idx" ON "EVoucherProduct"("voucherId", "productId");

-- CreateIndex
CREATE INDEX "EPayment_voucherId_method_idx" ON "EPayment"("voucherId", "method");

-- CreateIndex
CREATE INDEX "EPayment_receivedAt_idx" ON "EPayment"("receivedAt");

-- AddForeignKey
ALTER TABLE "EVoucherProduct" ADD CONSTRAINT "EVoucherProduct_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "EVoucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EPayment" ADD CONSTRAINT "EPayment_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "EVoucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
