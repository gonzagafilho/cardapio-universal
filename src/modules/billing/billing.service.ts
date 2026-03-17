import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';
import {
  getMonthlyAmountForPlan,
  getPricingPublic,
} from '../../common/constants/pricing-restaurants';
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
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysLeftInTrial: number | null;
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
const MP_API_BASE = 'https://api.mercadopago.com';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Retorna a tabela de precificação por quantidade de restaurantes (público).
   * Usado por frontend (/planos) e admin (billing) para exibição consistente.
   */
  getPricing() {
    return getPricingPublic();
  }

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
      trialStartsAt: null,
      trialEndsAt: null,
      isTrialActive: false,
      isTrialExpired: false,
      daysLeftInTrial: null,
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
        trialStartsAt: null,
        trialEndsAt: null,
        isTrialActive: false,
        isTrialExpired: false,
        daysLeftInTrial: null,
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
   * Cria fluxo de checkout Mercado Pago para assinatura recorrente.
   * Retorna URL para redirecionar o usuário. Se MP não estiver configurado, retorna null.
   */
  async createCheckoutSubscription(
    tenantId: string,
    plan: string,
    payerEmail: string,
  ): Promise<{ checkoutUrl: string } | null> {
    const accessToken = this.config.get<string>('mercadopago.accessToken');
    if (!accessToken?.trim()) {
      this.logger.debug('Mercado Pago não configurado (accessToken vazio)');
      return null;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, plan: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const planKey = plan.toLowerCase();
    if (!['basic', 'pro', 'enterprise'].includes(planKey)) {
      throw new BadRequestException('Plano inválido');
    }

    const backUrl = this.config.get<string>('mercadopago.backUrl') ?? '';
    const planAmounts = this.config.get<Record<string, number>>('mercadopago.planAmounts');
    const amount = planAmounts?.[planKey] ?? getMonthlyAmountForPlan(planKey);

    let sub = await this.prisma.subscription.findUnique({ where: { tenantId } });
    if (!sub) {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 7);
      sub = await this.prisma.subscription.create({
        data: {
          tenantId,
          plan: planKey,
          status: SubscriptionStatus.trialing,
          trialStartsAt: now,
          trialEndsAt: trialEnd,
          provider: null,
          externalSubscriptionId: null,
        },
      });
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { plan: planKey },
      });
    }

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 2);
    const body = {
      reason: `Nexora - Plano ${planKey}`,
      external_reference: tenantId,
      payer_email: payerEmail,
      status: 'pending' as const,
      back_url: backUrl,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months' as const,
        end_date: endDate.toISOString(),
        transaction_amount: amount,
        currency_id: 'BRL' as const,
      },
    };

    const res = await fetch(`${MP_API_BASE}/preapproval`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.logger.warn(`Mercado Pago preapproval failed: ${res.status}`, data);
      throw new BadRequestException(
        (data as { message?: string }).message ?? 'Falha ao criar checkout',
      );
    }

    const mpId = (data as { id?: string }).id;
    const initPoint = (data as { init_point?: string }).init_point ?? (data as { sandbox_init_point?: string }).sandbox_init_point;
    if (mpId) {
      await this.prisma.subscription.update({
        where: { tenantId },
        data: {
          externalSubscriptionId: mpId,
          provider: 'mercadopago',
          plan: planKey,
        },
      });
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { plan: planKey },
      });
      await this.prisma.billingEvent.create({
        data: {
          tenantId,
          eventType: 'subscription.checkout_created',
          payload: { provider: 'mercadopago', externalId: mpId, plan: planKey },
        },
      });
    }
    if (!initPoint) {
      this.logger.warn('Mercado Pago response missing init_point', data);
      throw new BadRequestException('Resposta do gateway sem link de pagamento');
    }
    this.logger.log(`Checkout MP created tenantId=${tenantId} plan=${planKey} preapprovalId=${mpId ?? 'missing'}`);
    return { checkoutUrl: initPoint };
  }

  /**
   * Processa webhook do Mercado Pago (subscription_preapproval).
   * Idempotente: eventos com mesmo provider + externalEventId são ignorados após o primeiro processamento.
   */
  async processMercadoPagoWebhook(
    payload: { type?: string; data?: { id?: string }; id?: string; notification_id?: string },
    xSignature?: string,
  ): Promise<void> {
    const type = payload.type;
    const preapprovalId = payload.data?.id;
    const provider = 'mercadopago';
    const externalEventId =
      payload.id != null
        ? String(payload.id)
        : payload.notification_id != null
          ? String(payload.notification_id)
          : null;
    this.logger.log(`Webhook MP received type=${type} data.id=${preapprovalId ?? 'missing'} externalEventId=${externalEventId ?? 'none'}`);
    if (payload.type !== 'subscription_preapproval' || !preapprovalId) {
      return;
    }
    if (externalEventId) {
      const existing = await this.prisma.billingEvent.findFirst({
        where: { provider, externalEventId },
      });
      if (existing) {
        this.logger.log(`Webhook MP idempotent skip externalEventId=${externalEventId}`);
        return;
      }
    }
    const webhookSecret = this.config.get<string>('mercadopago.webhookSecret');
    if (webhookSecret?.trim() && xSignature) {
      const valid = this.verifyMpSignature(payload, xSignature, webhookSecret);
      if (!valid) {
        this.logger.warn('Webhook MP signature validation failed');
        return;
      }
    }
    let sub = await this.prisma.subscription.findFirst({
      where: { externalSubscriptionId: preapprovalId },
    });
    const accessToken = this.config.get<string>('mercadopago.accessToken');
    if (!accessToken?.trim()) return;
    const res = await fetch(`${MP_API_BASE}/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const mp = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.logger.warn(`MP GET preapproval failed: ${res.status} preapprovalId=${preapprovalId}`);
      return;
    }
    const mpStatus = (mp as { status?: string }).status;
    const ourStatus = this.mapMpStatusToOurs(mpStatus);
    this.logger.log(`Webhook MP preapprovalId=${preapprovalId} mpStatus=${mpStatus ?? 'unknown'} ourStatus=${ourStatus ?? 'ignored'}`);
    if (!sub) {
      const externalRef = (mp as { external_reference?: string }).external_reference;
      if (externalRef) {
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: externalRef },
          select: { id: true },
        });
        if (tenant) {
          sub = await this.prisma.subscription.findUnique({
            where: { tenantId: tenant.id },
          });
          if (sub) {
            this.logger.log(`Webhook MP subscription found by external_reference tenantId=${tenant.id} subscriptionId=${sub.id}`);
            await this.prisma.subscription.update({
              where: { id: sub.id },
              data: { externalSubscriptionId: preapprovalId, provider: 'mercadopago' },
            });
          }
        }
      }
      if (!sub) {
        this.logger.warn(`Webhook MP subscription not found preapprovalId=${preapprovalId} external_reference=${(mp as { external_reference?: string }).external_reference ?? 'missing'}`);
        return;
      }
    }
    if (!ourStatus) return;
    const hasMaterialChange =
      sub.status !== ourStatus ||
      (ourStatus === SubscriptionStatus.active && (!sub.currentPeriodEnd || sub.cancelAtPeriodEnd || sub.cancelledAt)) ||
      (ourStatus === SubscriptionStatus.cancelled && !sub.cancelledAt);
    if (!hasMaterialChange) {
      this.logger.log(`Webhook MP skip redundant update subscriptionId=${sub.id} already status=${sub.status}`);
      return;
    }
    let billingEventId: string | null = null;
    try {
      const event = await this.prisma.billingEvent.create({
        data: {
          tenantId: sub.tenantId,
          eventType: 'webhook.mercadopago.preapproval',
          payload: { externalId: preapprovalId, mpStatus: mpStatus, ourStatus },
          provider,
          externalEventId: externalEventId ?? undefined,
          processedAt: null,
        },
      });
      billingEventId = event.id;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && (err as { code?: string }).code === 'P2002') {
        this.logger.log(`Webhook MP idempotent skip (unique) externalEventId=${externalEventId ?? 'n/a'}`);
        return;
      }
      throw err;
    }
    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: ourStatus,
        ...(ourStatus === SubscriptionStatus.active && {
          currentPeriodStart: new Date(),
          currentPeriodEnd: (() => {
            const e = new Date();
            e.setMonth(e.getMonth() + 1);
            return e;
          })(),
          cancelAtPeriodEnd: false,
          cancelledAt: null,
        }),
        ...(ourStatus === SubscriptionStatus.cancelled && { cancelledAt: new Date() }),
      },
    });
    if (ourStatus === SubscriptionStatus.active) {
      await this.prisma.tenant.update({
        where: { id: sub.tenantId },
        data: { plan: sub.plan },
      });
    }
    if (billingEventId) {
      await this.prisma.billingEvent.update({
        where: { id: billingEventId },
        data: { processedAt: new Date() },
      });
    }
    this.logger.log(`Webhook MP subscriptionId=${sub.id} updated to ${ourStatus}`);
  }

  private mapMpStatusToOurs(mpStatus: string | undefined): SubscriptionStatus | null {
    if (!mpStatus) return null;
    const s = mpStatus.toLowerCase();
    if (s === 'authorized') return SubscriptionStatus.active;
    if (s === 'cancelled' || s === 'canceled') return SubscriptionStatus.cancelled;
    if (s === 'paused') return SubscriptionStatus.past_due;
    if (s === 'expired') return SubscriptionStatus.cancelled;
    return null;
  }

  private verifyMpSignature(payload: { data?: { id?: string } }, xSignature: string, secret: string): boolean {
    try {
      const crypto = require('crypto');
      const parts = xSignature.split(',');
      let ts = '';
      let v1 = '';
      for (const p of parts) {
        if (p.startsWith('ts=')) ts = p.slice(3);
        if (p.startsWith('v1=')) v1 = p.slice(3);
      }
      const id = payload.data?.id ?? '';
      const template = `id:${id};ts:${ts};`;
      const hmac = crypto.createHmac('sha256', secret).update(template).digest('hex');
      return hmac === v1;
    } catch {
      return false;
    }
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
    trialStartsAt: Date | null;
    trialEndsAt: Date | null;
    provider: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SubscriptionView {
    const now = new Date();
    const trialEndsAt = sub.trialEndsAt ?? null;
    const isTrialing = sub.status === SubscriptionStatus.trialing;
    const isTrialActive =
      isTrialing && trialEndsAt != null && trialEndsAt >= now;
    const isTrialExpired =
      isTrialing && trialEndsAt != null && trialEndsAt < now;
    let daysLeftInTrial: number | null = null;
    if (isTrialing && trialEndsAt != null) {
      daysLeftInTrial =
        trialEndsAt >= now
          ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
          : 0;
    }
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
      trialStartsAt: sub.trialStartsAt?.toISOString() ?? null,
      trialEndsAt: trialEndsAt?.toISOString() ?? null,
      isTrialActive,
      isTrialExpired,
      daysLeftInTrial,
    };
  }
}
