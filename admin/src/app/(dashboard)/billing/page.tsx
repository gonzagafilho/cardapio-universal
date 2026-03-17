'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getSubscription,
  changePlan,
  getCheckoutUrl,
  cancelSubscription,
  reactivateSubscription,
  getInvoices,
} from '@/services/billing.service';
import { getEstablishments } from '@/services/establishment.service';
import { getPlanLimits, PLAN_OPTIONS, type PlanKey } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessBilling } from '@/lib/permissions';
import type { SubscriptionView, InvoiceView } from '@/types/billing';

const TRIAL_EXPIRED_STORAGE_KEY = 'trialExpired';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Ativo',
    cancelled: 'Cancelado',
    past_due: 'Inadimplente',
    trialing: 'Período de teste',
  };
  return map[status] ?? status;
}

function invoiceStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Rascunho',
    open: 'Aberto',
    paid: 'Pago',
    void: 'Cancelado',
    uncollectible: 'Inadimplente',
  };
  return map[status] ?? status;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionView | null>(null);
  const [invoices, setInvoices] = useState<InvoiceView[]>([]);
  const [establishmentsCount, setEstablishmentsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTrialExpiredBanner, setShowTrialExpiredBanner] = useState(false);

  const canView = user ? canAccessBilling(user.role) : false;

  const load = () => {
    if (!canView) return;
    setLoading(true);
    Promise.all([getSubscription(), getInvoices(), getEstablishments().then((list) => list.length).catch(() => null)])
      .then(([sub, inv, count]) => {
        setSubscription(sub ?? null);
        setInvoices(Array.isArray(inv) ? inv : []);
        setEstablishmentsCount(count ?? null);
        if (sub?.status === 'active' && typeof window !== 'undefined') {
          window.sessionStorage.removeItem(TRIAL_EXPIRED_STORAGE_KEY);
          setShowTrialExpiredBanner(false);
        }
        if (sub?.isTrialExpired === true) setShowTrialExpiredBanner(true);
      })
      .catch(() => {
        setSubscription(null);
        setInvoices([]);
        setEstablishmentsCount(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user || !canView) {
      setLoading(false);
      return;
    }
    load();
  }, [user, canView]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setShowTrialExpiredBanner(window.sessionStorage.getItem(TRIAL_EXPIRED_STORAGE_KEY) === '1');
  }, []);

  const handleChangePlan = async (plan: PlanKey) => {
    if (subscription?.plan === plan) return;
    setActionLoading(true);
    try {
      const checkout = await getCheckoutUrl(plan);
      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
        return;
      }
      const updated = await changePlan(plan);
      setSubscription(updated);
      if (updated.status === 'active' && typeof window !== 'undefined') {
        window.sessionStorage.removeItem(TRIAL_EXPIRED_STORAGE_KEY);
        setShowTrialExpiredBanner(false);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (immediately: boolean) => {
    setActionLoading(true);
    try {
      const updated = await cancelSubscription(immediately);
      setSubscription(updated);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      const updated = await reactivateSubscription();
      setSubscription(updated);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;
  if (!canView) {
    return (
      <AccessDenied description="Você não tem permissão para acessar a área de assinatura." />
    );
  }
  if (loading) return <LoadingPage />;

  const limits = subscription ? getPlanLimits(subscription.plan) : null;
  const isActive = subscription?.status === 'active' && !subscription?.cancelAtPeriodEnd;
  const isCancelled = subscription?.status === 'cancelled' || subscription?.cancelAtPeriodEnd;
  const showTrialExpiredAlert =
    showTrialExpiredBanner || subscription?.isTrialExpired === true;
  const showTrialActiveMessage =
    subscription?.isTrialActive === true &&
    subscription?.daysLeftInTrial != null;
  const currentPlanKey = (subscription?.plan ?? 'basic').toLowerCase() as PlanKey;
  const planOrder: PlanKey[] = ['basic', 'pro', 'enterprise'];
  const currentPlanIndex = planOrder.indexOf(currentPlanKey);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Assinatura e cobrança</h1>

      {showTrialActiveMessage && (
        <div
          className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900"
          role="status"
        >
          <p className="font-medium">
            Seu teste termina em {subscription.daysLeftInTrial}{' '}
            {subscription.daysLeftInTrial === 1 ? 'dia' : 'dias'}.
          </p>
          {subscription.trialEndsAt && (
            <p className="mt-1 text-sm">
              Data de término: {formatDate(subscription.trialEndsAt)}
            </p>
          )}
          <p className="mt-2 text-sm font-medium">
            Faça upgrade antes do vencimento para continuar sem interrupções.
          </p>
        </div>
      )}

      {showTrialExpiredAlert && (
        <div
          className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4 text-amber-900"
          role="alert"
        >
          <p className="font-semibold">Seu período de teste expirou.</p>
          <p className="mt-1 text-sm">
            Escolha um plano abaixo para continuar usando o sistema.
          </p>
          <p className="mt-2 text-sm font-medium">
            Selecione um plano e clique em &quot;Escolher plano&quot; para continuar.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Planos disponíveis</h2>
        <p className="mt-1 text-sm text-gray-500">
          Cobrança por quantidade de restaurantes. {showTrialExpiredAlert
            ? 'Selecione um plano para continuar.'
            : showTrialActiveMessage
              ? 'Você pode fazer upgrade a qualquer momento.'
              : 'Altere seu plano quando precisar de mais restaurantes.'}
        </p>
        <p className="mt-2 text-sm font-medium text-gray-700">
          Cada restaurante adicional: +R$ 119/mês
        </p>
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <p className="font-medium">Pagamento seguro no Mercado Pago</p>
          <p className="mt-0.5 text-blue-800/90">
            Ao clicar em &quot;Escolher plano&quot; ou &quot;Fazer upgrade&quot;, você será redirecionado ao site do Mercado Pago para informar seu cartão de forma segura. Não armazenamos dados de cartão.
          </p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PLAN_OPTIONS.map((option) => {
            const limitsForPlan = getPlanLimits(option.value);
            const isCurrent = currentPlanKey === option.value;
            const isUpgrade =
              planOrder.indexOf(option.value) > currentPlanIndex;
            return (
              <div
                key={option.value}
                className={`rounded-lg border-2 p-4 ${
                  isCurrent
                    ? 'border-primary bg-primary/5'
                    : showTrialExpiredAlert
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{option.label}</span>
                  {isCurrent && (
                    <Badge variant="success" className="text-xs">
                      Plano atual
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {limitsForPlan.establishments} restaurante{limitsForPlan.establishments !== 1 ? 's' : ''} incluído{limitsForPlan.establishments !== 1 ? 's' : ''},{' '}
                  {limitsForPlan.users} usuários
                </p>
                <div className="mt-4">
                  {isCurrent ? (
                    <Button variant="outline" size="sm" disabled className="w-full">
                      Plano atual
                    </Button>
                  ) : (
                    <Button
                      variant={showTrialExpiredAlert || isUpgrade ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={() => handleChangePlan(option.value)}
                      loading={actionLoading}
                    >
                      {isUpgrade ? 'Fazer upgrade' : 'Escolher plano'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Assinatura atual</h2>
        {subscription ? (
          <>
            {limits && (
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                <p className="font-medium text-gray-900">
                  Restaurantes incluídos no plano: até {limits.establishments} {limits.establishments === 1 ? 'restaurante' : 'restaurantes'}
                </p>
                {establishmentsCount != null && (
                  <p className="mt-1 text-gray-600">
                    Em uso: {establishmentsCount} de {limits.establishments}
                    {establishmentsCount >= limits.establishments && (
                      <span className="ml-1 font-medium text-amber-700"> — faça upgrade para adicionar mais</span>
                    )}
                  </p>
                )}
              </div>
            )}
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">Plano</dt>
                <dd className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{limits?.label ?? subscription.plan}</span>
                  <select
                    value={(subscription.plan ?? 'basic') as PlanKey}
                    onChange={(e) => handleChangePlan(e.target.value as PlanKey)}
                    disabled={actionLoading}
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-60"
                  >
                    {PLAN_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <Badge variant={isActive ? 'success' : 'error'}>{statusLabel(subscription.status)}</Badge>
                  {subscription.cancelAtPeriodEnd && (
                    <span className="ml-2 text-sm text-amber-600">(cancela ao fim do período)</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Próximo ciclo</dt>
                <dd className="text-gray-900">{formatDate(subscription.currentPeriodEnd)}</dd>
              </div>
              {subscription.status === 'trialing' && subscription.trialEndsAt && (
                <div>
                  <dt className="text-sm text-gray-500">Fim do trial</dt>
                  <dd className="text-gray-900">{formatDate(subscription.trialEndsAt)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {isActive && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleCancel(false)}
                  loading={actionLoading}
                >
                  Cancelar no fim do período
                </Button>
              )}
              {isCancelled && subscription.id && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleReactivate}
                  loading={actionLoading}
                >
                  Reativar assinatura
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-600">Nenhuma assinatura ativa. Seu plano atual é definido pela plataforma.</p>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Histórico de faturas</h2>
        {invoices.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Nenhuma fatura registrada ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium text-gray-900">
                    {inv.currency} {inv.amount.toFixed(2)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">{formatDate(inv.createdAt)}</span>
                </div>
                <Badge variant={inv.status === 'paid' ? 'success' : 'default'}>
                  {invoiceStatusLabel(inv.status)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
