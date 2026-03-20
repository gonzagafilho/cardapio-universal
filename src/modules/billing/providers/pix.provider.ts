import { createHmac } from 'crypto';

const MP_API_BASE = 'https://api.mercadopago.com';

export interface PixChargeInput {
  tenantId: string;
  serviceBindingId: string;
  amountCents: number;
  payerEmail: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PixChargeOutput {
  externalChargeId: string;
  pixCode: string;
  pixQrCodeUrl: string;
  expiresAt: Date;
  raw: unknown;
}

export interface ParsedPixWebhook {
  externalEventId?: string;
  externalChargeId?: string;
  status?: string;
  raw: unknown;
}

export class PixProviderAdapter {
  constructor(
    private readonly accessToken: string,
    private readonly webhookSecret?: string,
    private readonly notificationUrl?: string,
  ) {}

  async createPixCharge(input: PixChargeInput): Promise<PixChargeOutput> {
    if (!this.accessToken.trim()) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
    }

    const body = {
      transaction_amount: Number((input.amountCents / 100).toFixed(2)),
      description: input.description,
      payment_method_id: 'pix',
      payer: {
        email: input.payerEmail,
      },
      external_reference: `${input.tenantId}:${input.serviceBindingId}`,
      notification_url: this.notificationUrl?.trim() || undefined,
      metadata: input.metadata ?? {},
    };

    const idempotencyKey = `${input.tenantId}:${input.serviceBindingId}:${Date.now()}`;
    const res = await fetch(`${MP_API_BASE}/v1/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        (data as { message?: string; error?: string }).message ??
        (data as { message?: string; error?: string }).error ??
        'Falha ao criar cobrança PIX no Mercado Pago';
      throw new Error(message);
    }

    const id = String((data as { id?: string | number }).id ?? '');
    const tx = (data as { point_of_interaction?: { transaction_data?: { qr_code?: string; ticket_url?: string; qr_code_base64?: string } } }).point_of_interaction?.transaction_data;
    const pixCode = tx?.qr_code ?? '';
    const ticketUrl = tx?.ticket_url ?? '';
    const qrBase64 = tx?.qr_code_base64;
    const pixQrCodeUrl =
      ticketUrl ||
      (qrBase64 ? `data:image/png;base64,${qrBase64}` : '');
    const expiresAtRaw = (data as { date_of_expiration?: string }).date_of_expiration;
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : new Date(Date.now() + 30 * 60 * 1000);

    if (!id || !pixCode) {
      throw new Error('Resposta do provider sem id/qr_code PIX');
    }

    return {
      externalChargeId: id,
      pixCode,
      pixQrCodeUrl,
      expiresAt,
      raw: data,
    };
  }

  validateWebhook(payload: unknown, headers?: Record<string, string | string[] | undefined>): boolean {
    if (!this.webhookSecret?.trim()) return true;
    if (!headers) return false;
    const signatureRaw = headers['x-signature'];
    const xSignature = Array.isArray(signatureRaw) ? signatureRaw[0] : signatureRaw;
    if (!xSignature) return false;

    const p = payload as { data?: { id?: string | number } };
    const id = p?.data?.id != null ? String(p.data.id) : '';
    if (!id) return false;

    let ts = '';
    let v1 = '';
    for (const part of xSignature.split(',')) {
      if (part.startsWith('ts=')) ts = part.slice(3);
      if (part.startsWith('v1=')) v1 = part.slice(3);
    }
    if (!ts || !v1) return false;

    const template = `id:${id};ts:${ts};`;
    const digest = createHmac('sha256', this.webhookSecret).update(template).digest('hex');
    return digest === v1;
  }

  parseWebhook(payload: unknown): ParsedPixWebhook {
    const p = payload as {
      id?: string | number;
      type?: string;
      action?: string;
      data?: { id?: string | number };
    };
    const externalEventId = p.id != null ? String(p.id) : undefined;
    const externalChargeId = p.data?.id != null ? String(p.data.id) : undefined;
    const status = p.action ?? p.type;
    return { externalEventId, externalChargeId, status, raw: payload };
  }

  async getChargeStatus(externalChargeId: string): Promise<{ status?: string; raw: unknown }> {
    if (!externalChargeId) return { status: undefined, raw: {} };
    if (!this.accessToken.trim()) return { status: undefined, raw: {} };

    const res = await fetch(`${MP_API_BASE}/v1/payments/${externalChargeId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { status: undefined, raw: data };
    return { status: (data as { status?: string }).status, raw: data };
  }
}
