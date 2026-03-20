import { apiGet, apiPatch, apiPost } from './api';
import type {
  BillingInvoiceItem,
  BindServiceToTenantInput,
  CreatePixInvoiceInput,
  CreateServiceCatalogInput,
  PlatformOverview,
  ServiceCatalogItem,
  TenantServicesResponse,
  TenantServiceBindingItem,
  UpdateServiceCatalogInput,
  UpdateTenantServiceBindingInput,
} from '@/types/master-services';

export async function getPlatformOverview(): Promise<PlatformOverview> {
  return apiGet<PlatformOverview>('/master-services/overview');
}

export async function getServiceCatalog(): Promise<ServiceCatalogItem[]> {
  return apiGet<ServiceCatalogItem[]>('/master-services/catalog');
}

export async function getTenantServices(tenantId: string): Promise<TenantServicesResponse> {
  return apiGet<TenantServicesResponse>(`/master-services/tenants/${tenantId}/services`);
}

export async function createCatalogService(
  input: CreateServiceCatalogInput,
): Promise<ServiceCatalogItem> {
  return apiPost<ServiceCatalogItem>('/master-services/catalog', input);
}

export async function updateCatalogService(
  id: string,
  input: UpdateServiceCatalogInput,
): Promise<ServiceCatalogItem> {
  return apiPatch<ServiceCatalogItem>(`/master-services/catalog/${id}`, input);
}

export async function bindServiceToTenant(
  tenantId: string,
  input: BindServiceToTenantInput,
): Promise<TenantServiceBindingItem> {
  return apiPost<TenantServiceBindingItem>(`/master-services/tenants/${tenantId}/services`, input);
}

export async function updateTenantServiceBinding(
  tenantId: string,
  bindingId: string,
  input: UpdateTenantServiceBindingInput,
): Promise<TenantServiceBindingItem> {
  return apiPatch<TenantServiceBindingItem>(
    `/master-services/tenants/${tenantId}/services/${bindingId}`,
    input,
  );
}

export async function createPixInvoice(
  input: CreatePixInvoiceInput,
): Promise<BillingInvoiceItem> {
  return apiPost<BillingInvoiceItem>('/billing/invoices/pix', input);
}

export async function getBillingInvoiceById(id: string): Promise<BillingInvoiceItem> {
  return apiGet<BillingInvoiceItem>(`/billing/invoices/${id}`);
}
