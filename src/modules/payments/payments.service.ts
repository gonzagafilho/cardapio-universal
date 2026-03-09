import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

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
    // Placeholder para integração futura (Stripe, Mercado Pago, etc.)
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

  async createPix(
    tenantId: string,
    establishmentId: string,
    orderId: string,
    amount: number,
  ) {
    return this.createIntent(tenantId, establishmentId, orderId, amount, 'pix');
  }

  async createCard(
    tenantId: string,
    establishmentId: string,
    orderId: string,
    amount: number,
  ) {
    return this.createIntent(tenantId, establishmentId, orderId, amount, 'card');
  }

  async webhook(provider: string, payload: unknown) {
    // Placeholder para webhooks de provedores externos
    return { received: true, provider };
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
    };
  }
}
