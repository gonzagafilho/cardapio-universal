import { apiGet } from './api';
import type { SalesSummary, OrdersByDay, TopProduct, PaymentMethodsReport } from '@/types/report';

export async function getSalesSummary(
  establishmentId: string,
  start: string,
  end: string
): Promise<SalesSummary> {
  return apiGet<SalesSummary>(
    `/reports/sales-summary?establishmentId=${establishmentId}&start=${start}&end=${end}`
  );
}

export async function getOrdersByDay(
  establishmentId: string,
  start: string,
  end: string
): Promise<OrdersByDay> {
  return apiGet<OrdersByDay>(
    `/reports/orders-by-day?establishmentId=${establishmentId}&start=${start}&end=${end}`
  );
}

export async function getTopProducts(
  establishmentId: string,
  start: string,
  end: string,
  limit?: number
): Promise<TopProduct[]> {
  const qs = new URLSearchParams({ establishmentId, start, end });
  if (limit) qs.set('limit', String(limit));
  return apiGet<TopProduct[]>(`/reports/top-products?${qs}`);
}

export async function getPaymentMethodsReport(
  establishmentId: string,
  start: string,
  end: string
): Promise<PaymentMethodsReport> {
  return apiGet<PaymentMethodsReport>(
    `/reports/payment-methods?establishmentId=${establishmentId}&start=${start}&end=${end}`
  );
}

export async function getCancelledOrders(
  establishmentId: string,
  start: string,
  end: string
) {
  return apiGet(
    `/reports/cancelled-orders?establishmentId=${establishmentId}&start=${start}&end=${end}`
  );
}
