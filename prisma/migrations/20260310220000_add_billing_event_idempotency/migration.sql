-- AlterTable: BillingEvent - idempotência de webhook (provider, externalEventId, processedAt)
-- Compatível com dados existentes: colunas opcionais; UNIQUE permite múltiplos (NULL, NULL).

ALTER TABLE "BillingEvent" ADD COLUMN IF NOT EXISTS "provider" TEXT;
ALTER TABLE "BillingEvent" ADD COLUMN IF NOT EXISTS "externalEventId" TEXT;
ALTER TABLE "BillingEvent" ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "BillingEvent_provider_externalEventId_key" ON "BillingEvent"("provider", "externalEventId");
