import { apiGet } from './api';
import type { DashboardData } from '@/types/dashboard';

export async function getDashboard(establishmentId?: string): Promise<DashboardData> {
  const qs = establishmentId ? `?establishmentId=${establishmentId}` : '';
  return apiGet<DashboardData>(`/reports/dashboard${qs}`);
}
