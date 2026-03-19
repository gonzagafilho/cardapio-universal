-- CreateTable
CREATE TABLE "ServiceCatalog" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantServiceBinding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serviceCatalogId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "plan" TEXT,
    "notes" TEXT,
    "activatedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantServiceBinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCatalog_key_key" ON "ServiceCatalog"("key");

-- CreateIndex
CREATE INDEX "ServiceCatalog_isActive_idx" ON "ServiceCatalog"("isActive");

-- CreateIndex
CREATE INDEX "TenantServiceBinding_tenantId_idx" ON "TenantServiceBinding"("tenantId");

-- CreateIndex
CREATE INDEX "TenantServiceBinding_serviceCatalogId_idx" ON "TenantServiceBinding"("serviceCatalogId");

-- CreateIndex
CREATE INDEX "TenantServiceBinding_status_idx" ON "TenantServiceBinding"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TenantServiceBinding_tenantId_serviceCatalogId_key" ON "TenantServiceBinding"("tenantId", "serviceCatalogId");

-- AddForeignKey
ALTER TABLE "TenantServiceBinding" ADD CONSTRAINT "TenantServiceBinding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantServiceBinding" ADD CONSTRAINT "TenantServiceBinding_serviceCatalogId_fkey" FOREIGN KEY ("serviceCatalogId") REFERENCES "ServiceCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
