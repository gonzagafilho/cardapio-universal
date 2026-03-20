export interface ServiceCatalogItem {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tenantBindings: number;
  };
}

export interface CreateServiceCatalogInput {
  key: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateServiceCatalogInput {
  key?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface TenantServiceBindingItem {
  id: string;
  tenantId: string;
  serviceCatalogId: string;
  status: string;
  plan?: string | null;
  notes?: string | null;
  activatedAt?: string | null;
  suspendedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    key: string;
    name: string;
    description?: string | null;
    isActive: boolean;
  };
  billingInvoices?: BillingInvoiceItem[];
}

export interface BindServiceToTenantInput {
  serviceCatalogId: string;
  status?: string;
  plan?: string;
  notes?: string;
  activatedAt?: string;
}

export interface UpdateTenantServiceBindingInput {
  status?: string;
  plan?: string;
  notes?: string;
  activatedAt?: string;
  suspendedAt?: string;
}

export interface TenantServicesResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  bindings: TenantServiceBindingItem[];
}

export interface PlatformOverview {
  servicesTotal: number;
  servicesActive: number;
  tenantsTotal: number;
  tenantsActive: number;
  bindingsTotal: number;
  timestamp: string;
}

export interface BillingInvoiceItem {
  id: string;
  amountCents: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'FAILED';
  pixCode?: string | null;
  pixQrCodeUrl?: string | null;
  externalChargeId?: string | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePixInvoiceInput {
  tenantId: string;
  serviceBindingId: string;
  amountCents: number;
  metadata?: Record<string, unknown>;
}
