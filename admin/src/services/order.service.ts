import { apiGet, apiPatch } from './api';
import type { Order } from '@/types/order';

export async function getOrders(establishmentId?: string): Promise<Order[]> {
  const qs = establishmentId ? `?establishmentId=${establishmentId}` : '';
  return apiGet<Order[]>(`/orders${qs}`);
}

export async function getOrder(id: string): Promise<Order> {
  return apiGet<Order>(`/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  return apiPatch<Order>(`/orders/${id}/status`, { status });
}

export async function cancelOrder(id: string): Promise<Order> {
  return apiPatch<Order>(`/orders/${id}/cancel`);
}
