'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getTenant, updateTenant } from '@/services/tenant.service';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessPlatform } from '@/lib/permissions';
import { getPlanLimits, PLAN_OPTIONS, type PlanKey } from '@/lib/plans';
import type { Tenant } from '@/types/tenant';

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function PlatformTenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const canView = user ? canAccessPlatform(user.role) : false;

  useEffect(() => {
    if (!user || !canView) {
      setLoading(false);
      return;
    }
    getTenant(id)
      .then(setTenant)
      .catch(() => router.push('/platform/tenants'))
      .finally(() => setLoading(false));
  }, [id, user, canView, router]);

  const handleStatusChange = async () => {
    if (!tenant) return;
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    setUpdating(true);
    try {
      const updated = await updateTenant(id, { status: newStatus });
      setTenant(updated);
    } finally {
      setUpdating(false);
    }
  };

  const handlePlanChange = async (newPlan: PlanKey) => {
    if (!tenant || tenant.plan === newPlan) return;
    setUpdatingPlan(true);
    try {
      const updated = await updateTenant(id, { plan: newPlan });
      setTenant(updated);
    } finally {
      setUpdatingPlan(false);
    }
  };

  if (!user) return null;
  if (!canView) {
    return (
      <AccessDenied description="Acesso restrito à plataforma. Apenas Super Admin." />
    );
  }
  if (loading || !tenant) return <LoadingPage />;

  const isActive = tenant.status === 'active';

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/platform/tenants">
          <Button variant="ghost" size="sm">
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-0.5 text-gray-900">{tenant.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Plano</dt>
            <dd className="mt-0.5 flex items-center gap-2">
              <select
                value={(tenant.plan ?? 'basic') as PlanKey}
                onChange={(e) => handlePlanChange(e.target.value as PlanKey)}
                disabled={updatingPlan}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-60"
              >
                {PLAN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {updatingPlan && <span className="text-xs text-gray-500">Salvando…</span>}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-0.5">
              <Badge variant={isActive ? 'success' : 'error'}>
                {isActive ? 'Ativo' : tenant.status === 'suspended' ? 'Suspenso' : tenant.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estabelecimentos</dt>
            <dd className="mt-0.5 text-gray-900">
              {tenant._count?.establishments ?? 0} / {getPlanLimits(tenant.plan).establishments}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Usuários</dt>
            <dd className="mt-0.5 text-gray-900">
              {tenant._count?.users ?? 0} / {getPlanLimits(tenant.plan).users}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Criado em</dt>
            <dd className="mt-0.5 text-gray-900">{formatDate(tenant.createdAt)}</dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <Button
            variant={isActive ? 'danger' : 'primary'}
            size="sm"
            onClick={handleStatusChange}
            loading={updating}
          >
            {isActive ? 'Suspender tenant' : 'Ativar tenant'}
          </Button>
        </div>
      </div>
    </div>
  );
}
