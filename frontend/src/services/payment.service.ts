import { apiPost, apiGet } from './api';

const PAYMENTS_PATH = '/payments';

export async function createPaymentIntent(
  establishmentId: string,
  orderId: string,
  amount: number,
  method: string
): Promise<{ paymentId: string; clientSecret: string | null }> {
  return apiPost<{ paymentId: string; clientSecret: string | null }>(
    `${PAYMENTS_PATH}/create-intent`,
    { establishmentId, orderId, amount, method }
  );
}

export async function createPixPayment(
  establishmentId: string,
  orderId: string,
  amount: number
): Promise<{ paymentId: string; qrCode?: string }> {
  return apiPost<{ paymentId: string; qrCode?: string }>(
    `${PAYMENTS_PATH}/pix`,
    { establishmentId, orderId, amount }
  );
}

export async function getPaymentStatus(
  paymentId: string
): Promise<{ status: string; amount: number; paidAt?: string }> {
  return apiGet<{ status: string; amount: number; paidAt?: string }>(
    `${PAYMENTS_PATH}/${paymentId}/status`
  );
}
