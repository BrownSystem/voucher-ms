/*
  Warnings:

  - The values [NOTA_CREDITO] on the enum `VoucherType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VoucherType_new" AS ENUM ('FACTURA', 'REMITO', 'NOTA_CREDITO_PROVEEDOR', 'NOTA_CREDITO_CLIENTE', 'P');
ALTER TABLE "EVoucher" ALTER COLUMN "type" TYPE "VoucherType_new" USING ("type"::text::"VoucherType_new");
ALTER TYPE "VoucherType" RENAME TO "VoucherType_old";
ALTER TYPE "VoucherType_new" RENAME TO "VoucherType";
DROP TYPE "VoucherType_old";
COMMIT;
