import { apiPost, apiGet } from './api';

export interface CreatePixResponse {
  paymentId: string;
  mpPaymentId: string | null;
  status: string;
  qrCodeBase64: string | null;
  qrCode: string | null;
  expiresAt?: string | null;
}

export interface PaymentStatusResponse {
  id: string;
  status: string;
  amount: number;
  paidAt: string | null;
  orderId: string;
  orderPaymentStatus?: string;
}

export async function createPix(params: {
  establishmentId: string;
  orderId: string;
  amount: number;
  payerEmail?: string;
}): Promise<CreatePixResponse> {
  return apiPost<CreatePixResponse>('/payments/pix', {
    establishmentId: params.establishmentId,
    orderId: params.orderId,
    amount: params.amount,
    payerEmail: params.payerEmail ?? '',
  });
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  return apiGet<PaymentStatusResponse>(`/payments/${paymentId}/status`);
}
