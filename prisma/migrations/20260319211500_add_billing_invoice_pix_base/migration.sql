-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('PIX_AUTOMATIC');

-- CreateEnum
CREATE TYPE "BillingInvoiceStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'FAILED');

-- AlterTable
ALTER TABLE "BillingEvent" ADD COLUMN "invoiceId" TEXT;

-- CreateTable
CREATE TABLE "BillingInvoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serviceBindingId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "billingType" "BillingType" NOT NULL DEFAULT 'PIX_AUTOMATIC',
    "status" "BillingInvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "externalChargeId" TEXT,
    "pixCode" TEXT,
    "pixQrCodeUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingInvoice_externalChargeId_key" ON "BillingInvoice"("externalChargeId");

-- CreateIndex
CREATE INDEX "BillingInvoice_tenantId_idx" ON "BillingInvoice"("tenantId");

-- CreateIndex
CREATE INDEX "BillingInvoice_serviceBindingId_idx" ON "BillingInvoice"("serviceBindingId");

-- CreateIndex
CREATE INDEX "BillingInvoice_status_idx" ON "BillingInvoice"("status");

-- CreateIndex
CREATE INDEX "BillingInvoice_createdAt_idx" ON "BillingInvoice"("createdAt");

-- CreateIndex
CREATE INDEX "BillingEvent_invoiceId_idx" ON "BillingEvent"("invoiceId");

-- AddForeignKey
ALTER TABLE "BillingEvent" ADD CONSTRAINT "BillingEvent_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_serviceBindingId_fkey" FOREIGN KEY ("serviceBindingId") REFERENCES "TenantServiceBinding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
