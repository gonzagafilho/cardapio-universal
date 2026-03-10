import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';
/** Resposta da assinatura atual do tenant (para API e admin). */
export interface SubscriptionView {
  id: string;
  tenantId: string;
  plan: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Resposta de fatura (para listagem). */
export interface InvoiceView {
  id: string;
  tenantId: string;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  status: string;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

/**
 * Serviço de billing recorrente SaaS.
 * Desacoplado do módulo Payments (pagamento de pedidos).
 * Não chama gateway real; preparado para integração futura.
 */
@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna a assinatura atual do tenant.
   * Se não existir registro em Subscription, deriva do Tenant.plan (compatibilidade).
   */
  async getSubscription(tenantId: string): Promise<SubscriptionView | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, plan: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (sub) {
      return this.toSubscriptionView(sub);
    }
    // Sem registro de assinatura: retornar vista “implícita” baseada no plano do tenant
    return {
      id: '',
      tenantId: tenant.id,
      plan: tenant.plan,
      status: SubscriptionStatus.active,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      provider: null,
      createdAt: '',
      updatedAt: '',
    };
  }

  /**
   * Altera o plano do tenant.
   * Atualiza Tenant.plan e cria/atualiza Subscription (sem cobrança real).
   */
  async changePlan(tenantId: string, plan: string): Promise<SubscriptionView> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const planKey = plan.toLowerCase();
    if (!['basic', 'pro', 'enterprise'].includes(planKey)) {
      throw new BadRequestException('Plano inválido');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id: tenantId },
        data: { plan: planKey },
      });
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await tx.subscription.upsert({
        where: { tenantId },
        create: {
          tenantId,
          plan: planKey,
          status: SubscriptionStatus.active,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        update: {
          plan: planKey,
          status: SubscriptionStatus.active,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          cancelledAt: null,
        },
      });
      await tx.billingEvent.create({
        data: {
          tenantId,
          eventType: 'subscription.plan_changed',
          payload: { plan: planKey },
        },
      });
    });

    const updated = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (!updated) throw new NotFoundException('Assinatura não encontrada após atualização');
    return this.toSubscriptionView(updated);
  }

  /**
   * Marca a assinatura para cancelamento no fim do período (ou cancela imediatamente se sem período).
   * Não altera Tenant.status; preparado para futura lógica de inadimplência.
   */
  async cancel(tenantId: string, immediately = false): Promise<SubscriptionView> {
    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (!sub) {
      // Só existe plano no Tenant: “cancelar” = apenas registrar evento; não mudar Tenant.plan aqui
      await this.prisma.billingEvent.create({
        data: { tenantId, eventType: 'subscription.cancel_requested', payload: { immediately } },
      });
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { plan: true },
      });
      return {
        id: '',
        tenantId,
        plan: tenant?.plan ?? 'basic',
        status: 'cancelled',
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        cancelledAt: new Date().toISOString(),
        provider: null,
        createdAt: '',
        updatedAt: '',
      };
    }

    const now = new Date();
    if (immediately) {
      await this.prisma.subscription.update({
        where: { tenantId },
        data: {
          status: SubscriptionStatus.cancelled,
          cancelAtPeriodEnd: false,
          cancelledAt: now,
        },
      });
    } else {
      await this.prisma.subscription.update({
        where: { tenantId },
        data: { cancelAtPeriodEnd: true },
      });
    }
    await this.prisma.billingEvent.create({
      data: {
        tenantId,
        eventType: immediately ? 'subscription.cancelled' : 'subscription.cancel_at_period_end',
        payload: { immediately },
      },
    });

    const updated = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (!updated) throw new NotFoundException('Assinatura não encontrada');
    return this.toSubscriptionView(updated);
  }

  /**
   * Reativa assinatura cancelada (remove cancelAtPeriodEnd e restaura active).
   */
  async reactivate(tenantId: string): Promise<SubscriptionView> {
    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (!sub) {
      throw new BadRequestException('Não há assinatura para reativar');
    }
    if (sub.status !== SubscriptionStatus.cancelled && !sub.cancelAtPeriodEnd) {
      throw new BadRequestException('Assinatura já está ativa');
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: SubscriptionStatus.active,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
    await this.prisma.billingEvent.create({
      data: { tenantId, eventType: 'subscription.reactivated', payload: {} },
    });

    const updated = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (!updated) throw new NotFoundException('Assinatura não encontrada');
    return this.toSubscriptionView(updated);
  }

  /**
   * Lista faturas do tenant (histórico).
   */
  async getInvoices(tenantId: string, limit = 50): Promise<InvoiceView[]> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const list = await this.prisma.subscriptionInvoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return list.map((i) => ({
      id: i.id,
      tenantId: i.tenantId,
      subscriptionId: i.subscriptionId,
      amount: Number(i.amount),
      currency: i.currency,
      status: i.status,
      dueAt: i.dueAt?.toISOString() ?? null,
      paidAt: i.paidAt?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString(),
    }));
  }

  private toSubscriptionView(sub: {
    id: string;
    tenantId: string;
    plan: string;
    status: string;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    cancelledAt: Date | null;
    provider: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SubscriptionView {
    return {
      id: sub.id,
      tenantId: sub.tenantId,
      plan: sub.plan,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart?.toISOString() ?? null,
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      cancelledAt: sub.cancelledAt?.toISOString() ?? null,
      provider: sub.provider,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
    };
  }
}
