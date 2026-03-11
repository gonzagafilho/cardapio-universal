import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';

const MP_API_BASE = 'https://api.mercadopago.com';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createIntent(
    tenantId: string,
    establishmentId: string,
    orderId: string,
    amount: number,
    method: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId, establishmentId },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        establishmentId,
        orderId,
        provider: 'internal',
        method,
        status: 'pending',
        amount: new Decimal(amount),
      },
    });
    return {
      paymentId: payment.id,
      clientSecret: null,
      message: 'Integração de pagamento a ser implementada',
    };
  }

  /**
   * Gera pagamento PIX via Mercado Pago.
   * Cria registro Payment, chama API MP, retorna QR code e copy-paste.
   */
  async createPix(
    tenantId: string,
    establishmentId: string,
    orderId: string,
    amount: number,
    payerEmail: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId, establishmentId },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Pedido já está pago');
    }

    const accessToken = this.config.get<string>('mercadopago.accessToken');
    if (!accessToken?.trim()) {
      throw new BadRequestException('Pagamento PIX não configurado (Mercado Pago)');
    }

    const notificationUrl = this.config.get<string>('mercadopago.paymentNotificationUrl');
    const body: Record<string, unknown> = {
      transaction_amount: Math.round(amount * 100) / 100,
      payment_method_id: 'pix',
      payer: { email: payerEmail || 'cliente@email.com' },
      description: `Pedido #${order.orderNumber}`,
      external_reference: orderId,
    };
    if (notificationUrl?.trim()) {
      body.notification_url = notificationUrl.trim();
    }

    const idempotencyKey = randomUUID();
    const res = await fetch(`${MP_API_BASE}/v1/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as {
      id?: number;
      status?: string;
      status_detail?: string;
      point_of_interaction?: {
        transaction_data?: {
          qr_code_base64?: string;
          qr_code?: string;
        };
      };
      message?: string;
    };

    if (!res.ok) {
      this.logger.warn(`MP PIX create failed: ${res.status}`, data);
      throw new BadRequestException(
        (data as { message?: string }).message ?? data.status_detail ?? 'Falha ao gerar PIX',
      );
    }

    const mpPaymentId = data.id != null ? String(data.id) : null;
    const pointOfInteraction = data.point_of_interaction?.transaction_data;
    const qrCodeBase64 = pointOfInteraction?.qr_code_base64 ?? null;
    const qrCode = pointOfInteraction?.qr_code ?? null;

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        establishmentId,
        orderId,
        provider: 'mercadopago',
        method: 'pix',
        status: (data.status ?? 'pending').toLowerCase(),
        amount: new Decimal(amount),
        transactionId: mpPaymentId,
        externalReference: orderId,
        rawPayload: data as unknown as object,
      },
    });

    if (data.status === 'approved') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.PAID },
      });
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'approved', paidAt: new Date() },
      });
    }

    return {
      paymentId: payment.id,
      mpPaymentId,
      status: data.status,
      qrCodeBase64,
      qrCode,
      expiresAt: pointOfInteraction ? null : undefined,
    };
  }

  async createCard(
    tenantId: string,
    establishmentId: string,
    orderId: string,
    amount: number,
  ) {
    return this.createIntent(tenantId, establishmentId, orderId, amount, 'card');
  }

  /**
   * Webhook Mercado Pago para pagamentos (PIX, etc.).
   * Payload pode ser: { type, data: { id } } (notification) ou query topic=payment&id=xxx.
   */
  async webhook(provider: string, payload: unknown) {
    if (provider?.toLowerCase() !== 'mercadopago') {
      return { received: true, provider };
    }

    const accessToken = this.config.get<string>('mercadopago.accessToken');
    if (!accessToken?.trim()) {
      this.logger.warn('Webhook MP payment: accessToken not configured');
      return { received: true };
    }

    let paymentId: string | null = null;
    const body = payload as { type?: string; data?: { id?: string }; id?: string };
    if (body.data?.id != null) {
      paymentId = String(body.data.id);
    } else if (body.id != null) {
      paymentId = String(body.id);
    }
    if (!paymentId) {
      this.logger.log('Webhook MP payment: no payment id in payload');
      return { received: true };
    }

    const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const mp = (await res.json().catch(() => ({}))) as {
      id?: number;
      status?: string;
      external_reference?: string;
    };
    if (!res.ok || !mp.external_reference) {
      this.logger.warn(`Webhook MP: GET payment failed or no external_reference: ${res.status}`);
      return { received: true };
    }

    const orderId = mp.external_reference;
    const status = (mp.status ?? '').toLowerCase();
    if (status !== 'approved') {
      this.logger.log(`Webhook MP payment ${paymentId} status=${status}, skipping order update`);
      return { received: true };
    }

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: String(mp.id), orderId },
      include: { order: true },
    });
    if (!payment) {
      this.logger.warn(`Webhook MP: Payment not found transactionId=${mp.id} orderId=${orderId}`);
      return { received: true };
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'approved', paidAt: new Date(), rawPayload: mp as unknown as object },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.PAID },
      }),
    ]);
    this.logger.log(`Webhook MP: order ${orderId} marked as PAID`);
    return { received: true };
  }

  async getStatus(tenantId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Pagamento não encontrado');
    return {
      id: payment.id,
      status: payment.status,
      amount: Number(payment.amount),
      paidAt: payment.paidAt,
      orderId: payment.orderId,
      orderPaymentStatus: payment.order?.paymentStatus,
    };
  }
}
