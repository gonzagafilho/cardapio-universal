import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Establishment } from '@/types/establishment';

export async function getEstablishments(): Promise<Establishment[]> {
  return apiGet<Establishment[]>('/establishments');
}

export async function getEstablishment(id: string): Promise<Establishment> {
  return apiGet<Establishment>(`/establishments/${id}`);
}

export async function createEstablishment(dto: import('@/types/establishment').CreateEstablishmentDto): Promise<Establishment> {
  return apiPost<Establishment>('/establishments', dto);
}

export async function updateEstablishment(id: string, dto: import('@/types/establishment').UpdateEstablishmentDto): Promise<Establishment> {
  return apiPatch<Establishment>(`/establishments/${id}`, dto);
}

export async function deleteEstablishment(id: string): Promise<void> {
  return apiDelete(`/establishments/${id}`);
}
