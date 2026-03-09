import { apiPost, apiGet } from './api';
import type { Order } from '@/types/order';

const ORDERS_PATH = '/orders';

export interface CreateOrderDto {
  establishmentId: string;
  cartId: string;
  type: 'delivery' | 'pickup' | 'dine_in';
  paymentMethod?: string;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  customerId?: string;
}

export async function createOrder(dto: CreateOrderDto): Promise<Order> {
  return apiPost<Order>(ORDERS_PATH, dto);
}

export async function getOrder(orderId: string): Promise<Order> {
  return apiGet<Order>(`${ORDERS_PATH}/${orderId}`);
}
