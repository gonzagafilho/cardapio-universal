import { apiGet, apiPatch } from './api';
import type { Tenant, UpdateTenantDto } from '@/types/tenant';

export async function getTenants(): Promise<Tenant[]> {
  return apiGet<Tenant[]>('/tenants');
}

export async function getTenant(id: string): Promise<Tenant> {
  return apiGet<Tenant>(`/tenants/${id}`);
}

export async function updateTenant(id: string, dto: UpdateTenantDto): Promise<Tenant> {
  return apiPatch<Tenant>(`/tenants/${id}`, dto);
}
