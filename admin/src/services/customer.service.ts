import { apiGet } from './api';
import type { Customer } from '@/types/customer';
import type { Order } from '@/types/order';

export async function getCustomers(establishmentId?: string): Promise<Customer[]> {
  const qs = establishmentId ? `?establishmentId=${establishmentId}` : '';
  return apiGet<Customer[]>(`/customers${qs}`);
}

export async function getCustomer(id: string): Promise<Customer> {
  return apiGet<Customer>(`/customers/${id}`);
}

export async function getCustomerOrders(id: string): Promise<Order[]> {
  return apiGet<Order[]>(`/customers/${id}/orders`);
}
