import { apiGet, apiPatch, apiPost } from './api';
import type { SubscriptionView, InvoiceView } from '@/types/billing';

export interface CheckoutSubscriptionResponse {
  checkoutUrl: string | null;
  message?: string;
}

export async function getSubscription(): Promise<SubscriptionView | null> {
  return apiGet<SubscriptionView | null>('/billing/subscription');
}

export async function getCheckoutUrl(plan: string): Promise<CheckoutSubscriptionResponse> {
  return apiPost<CheckoutSubscriptionResponse>('/billing/subscription/checkout', { plan });
}

export async function changePlan(plan: string): Promise<SubscriptionView> {
  return apiPatch<SubscriptionView>('/billing/subscription/plan', { plan });
}

export async function cancelSubscription(immediately = false): Promise<SubscriptionView> {
  return apiPost<SubscriptionView>('/billing/subscription/cancel', { immediately });
}

export async function reactivateSubscription(): Promise<SubscriptionView> {
  return apiPost<SubscriptionView>('/billing/subscription/reactivate');
}

export async function getInvoices(limit?: number): Promise<InvoiceView[]> {
  const params = limit != null ? `?limit=${limit}` : '';
  return apiGet<InvoiceView[]>(`/billing/invoices${params}`);
}
