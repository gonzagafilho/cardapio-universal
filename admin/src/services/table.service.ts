import { apiGet, apiPost } from './api';
import type { Table, CreateTableDto } from '@/types/table';

export async function getEstablishmentTables(establishmentId: string): Promise<Table[]> {
  return apiGet<Table[]>(`/establishments/${establishmentId}/tables`);
}

export async function createEstablishmentTable(establishmentId: string, dto: CreateTableDto): Promise<Table> {
  return apiPost<Table>(`/establishments/${establishmentId}/tables`, dto);
}

export async function regenerateEstablishmentTableToken(establishmentId: string, tableId: string): Promise<Table> {
  return apiPost<Table>(`/establishments/${establishmentId}/tables/${tableId}/token`);
}

