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
