import { apiGet } from './api';
import type { Payment } from '@/types/payment';

export async function getPayments(establishmentId?: string): Promise<Payment[]> {
  const qs = establishmentId ? `?establishmentId=${establishmentId}` : '';
  return apiGet<Payment[]>(`/payments${qs}`);
}
