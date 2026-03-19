import { apiGet } from './api';
import type {
  PlatformOverview,
  ServiceCatalogItem,
  TenantServicesResponse,
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
