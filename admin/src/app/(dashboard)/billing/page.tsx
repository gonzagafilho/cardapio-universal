'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getSubscription,
  changePlan,
  cancelSubscription,
  reactivateSubscription,
  getInvoices,
} from '@/services/billing.service';
import { getPlanLimits, PLAN_OPTIONS, type PlanKey } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessBilling } from '@/lib/permissions';
import type { SubscriptionView, InvoiceView } from '@/types/billing';

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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const canView = user ? canAccessBilling(user.role) : false;

  const load = () => {
    if (!canView) return;
    setLoading(true);
    Promise.all([getSubscription(), getInvoices()])
      .then(([sub, inv]) => {
        setSubscription(sub ?? null);
        setInvoices(Array.isArray(inv) ? inv : []);
      })
      .catch(() => {
        setSubscription(null);
        setInvoices([]);
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

  const handleChangePlan = async (plan: PlanKey) => {
    if (!subscription || subscription.plan === plan) return;
    setActionLoading(true);
    try {
      const updated = await changePlan(plan);
      setSubscription(updated);
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

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Assinatura e cobrança</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Assinatura atual</h2>
        {subscription ? (
          <>
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
