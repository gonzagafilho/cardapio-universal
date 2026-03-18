-- CreateEnum
CREATE TYPE "TableSessionPaymentStatus" AS ENUM ('PENDING', 'PAID');

-- AlterTable TableSession: conta da mesa (campos opcionais)
ALTER TABLE "TableSession" ADD COLUMN "serviceFeeAmount" DECIMAL(10,2);
ALTER TABLE "TableSession" ADD COLUMN "discountAmount" DECIMAL(10,2);
ALTER TABLE "TableSession" ADD COLUMN "finalAmount" DECIMAL(10,2);
ALTER TABLE "TableSession" ADD COLUMN "paymentStatus" "TableSessionPaymentStatus" NOT NULL DEFAULT 'PENDING';
