import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, PaymentStatus, TableSessionPaymentStatus, TableSessionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';
import { PAYMENTS_WEBHOOK_QUEUE } from './payment-webhook.processor';
import { OrdersGateway, ORDER_EVENTS } from '../orders/orders.gateway';

const MP_API_BASE = 'https://api.mercadopago.com';

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Optional() @InjectQueue(PAYMENTS_WEBHOOK_QUEUE) private readonly webhookQueue: Queue | null,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  onModuleInit(): void {
    if (!this.webhookQueue) {
      this.logger.log(
        'Webhook queue disabled (REDIS_URL not set). Webhooks will be processed synchronously.',
      );
    }
  }

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

    const existingPix = await this.prisma.payment.findFirst({
      where: {
        tenantId,
        establishmentId,
        orderId,
        provider: 'mercadopago',
        method: 'pix',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPix) {
      const statusLower = existingPix.status.toLowerCase();
      if (statusLower === 'approved' || statusLower === 'pending') {
        const raw = existingPix.rawPayload as {
          point_of_interaction?: { transaction_data?: { qr_code_base64?: string; qr_code?: string } };
        } | null;
        const pointOfInteraction = raw?.point_of_interaction?.transaction_data;
        return {
          paymentId: existingPix.id,
          mpPaymentId: existingPix.transactionId ?? null,
          status: existingPix.status,
          qrCodeBase64: pointOfInteraction?.qr_code_base64 ?? null,
          qrCode: pointOfInteraction?.qr_code ?? null,
          expiresAt: pointOfInteraction ? null : undefined,
        };
      }
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
   * Enfileira o job e responde 200 rápido; o worker processa em background.
   * Se a fila falhar (ex.: Redis indisponível), processa de forma síncrona.
   */
  async webhook(provider: string, payload: unknown) {
    if (provider?.toLowerCase() !== 'mercadopago') {
      return { received: true, provider };
    }

    if (!this.webhookQueue) {
      this.logger.log('Webhook queue not configured (REDIS_URL not set), processing sync');
      await this.processMercadoPagoWebhookInternal(provider, payload);
      return { received: true };
    }

    try {
      await this.webhookQueue.add('process', { provider, payload });
      return { received: true, queued: true };
    } catch (err) {
      this.logger.warn(
        'Webhook queue unavailable (Redis down), processing sync',
        (err as Error)?.message,
      );
      await this.processMercadoPagoWebhookInternal(provider, payload);
      return { received: true };
    }
  }

  /**
   * Lógica de processamento do webhook Mercado Pago (GET MP, atualiza Payment e Order).
   * Usado pelo worker e como fallback quando a fila não está disponível.
   */
  async processMercadoPagoWebhookInternal(provider: string, payload: unknown): Promise<void> {
    if (provider?.toLowerCase() !== 'mercadopago') return;

    const accessToken = this.config.get<string>('mercadopago.accessToken');
    if (!accessToken?.trim()) {
      this.logger.warn('Webhook MP payment: accessToken not configured');
      return;
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
      return;
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
      return;
    }

    const externalReference = mp.external_reference;
    const status = (mp.status ?? '').toLowerCase();
    if (status !== 'approved') {
      this.logger.log(`Webhook MP payment ${paymentId} status=${status}, skipping order update`);
      return;
    }

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: String(mp.id), orderId: externalReference },
      include: { order: true },
    });
    if (!payment) {
      // Fallback: pagamento PIX pode estar vinculado a uma TableSession (external_reference = tableSessionId)
      const session = await this.prisma.tableSession.findFirst({
        where: { id: externalReference },
        select: { id: true, status: true, paymentStatus: true },
      });

      if (
        session &&
        session.status === TableSessionStatus.CLOSED &&
        session.paymentStatus !== TableSessionPaymentStatus.PAID
      ) {
        await this.prisma.tableSession.update({
          where: { id: session.id },
          data: { paymentStatus: TableSessionPaymentStatus.PAID },
        });
        this.logger.log(`Webhook MP: table session ${session.id} marked as PAID`);
      } else {
        this.logger.warn(
          `Webhook MP: Payment not found transactionId=${mp.id} and no matching CLOSED table session for externalReference=${externalReference}`,
        );
      }
      return;
    }

    const orderUpdateData: { paymentStatus: PaymentStatus; status?: OrderStatus } = {
      paymentStatus: PaymentStatus.PAID,
    };
    if (payment.order.status === OrderStatus.PENDING) {
      orderUpdateData.status = OrderStatus.CONFIRMED;
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'approved', paidAt: new Date(), rawPayload: mp as unknown as object },
      }),
      this.prisma.order.update({
        where: { id: externalReference },
        data: orderUpdateData,
      }),
    ]);
    this.logger.log(
      `Webhook MP: order ${externalReference} marked as PAID` +
        (orderUpdateData.status === OrderStatus.CONFIRMED ? ', status CONFIRMED' : ''),
    );
    const establishmentId = payment.order.establishmentId;
    if (establishmentId) {
      this.ordersGateway.emitToEstablishment(establishmentId, ORDER_EVENTS.CONFIRMED, {
        orderId: externalReference,
        establishmentId,
      });
    }
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
