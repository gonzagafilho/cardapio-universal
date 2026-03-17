-- Slug do Establishment passa a ser único globalmente (resolução pública por URL).
-- ATENÇÃO: Se existirem slugs duplicados entre tenants, esta migration falhará.
-- Verificar antes: SELECT slug, COUNT(*) FROM "Establishment" GROUP BY slug HAVING COUNT(*) > 1;
-- Se houver duplicados, altere um deles (ex.: UPDATE "Establishment" SET slug = slug || '_' || "id" WHERE ...) e rode novamente.

-- Remover constraint única composta (tenantId, slug)
ALTER TABLE "Establishment" DROP CONSTRAINT IF EXISTS "Establishment_tenantId_slug_key";

-- Criar constraint única em slug (global)
CREATE UNIQUE INDEX "Establishment_slug_key" ON "Establishment"("slug");

-- Índice composto para consultas por tenantId + slug (admin/onboarding)
CREATE INDEX "Establishment_tenantId_slug_idx" ON "Establishment"("tenantId", "slug");
