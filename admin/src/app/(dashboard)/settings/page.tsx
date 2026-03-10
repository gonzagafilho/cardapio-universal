'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getStoreSettings, updateStoreSettings } from '@/services/settings.service';
import { getTenant } from '@/services/tenant.service';
import { SettingsForm } from '@/components/forms';
import { LoadingPage } from '@/components/ui/loading';
import { getPlanLimits } from '@/lib/plans';
import type { Tenant } from '@/types/tenant';

export default function SettingsPage() {
  const { user } = useAuth();
  const establishmentId = user?.establishmentId ?? '';
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStoreSettings(establishmentId).then((d) => setSettings((d as Record<string, unknown>) ?? {})).finally(() => setLoading(false));
  }, [establishmentId]);

  useEffect(() => {
    if (!user?.tenantId) return;
    getTenant(user.tenantId).then(setTenant).catch(() => setTenant(null));
  }, [user?.tenantId]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await updateStoreSettings(establishmentId, data);
      setSettings((p) => (p ? { ...p, ...data } : data));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  const limits = tenant ? getPlanLimits(tenant.plan) : null;
  const usageEstablishments = tenant?._count?.establishments ?? 0;
  const usageUsers = tenant?._count?.users ?? 0;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      {tenant && limits && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Seu plano</h2>
          <p className="mt-1 text-sm text-gray-600">
            Plano atual: <strong>{limits.label}</strong>
          </p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Estabelecimentos</dt>
              <dd className="text-gray-900">
                {usageEstablishments} / {limits.establishments}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Usuários</dt>
              <dd className="text-gray-900">
                {usageUsers} / {limits.users}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-gray-500">
            Para alterar seu plano, entre em contato com o suporte ou acesse a área da plataforma (Super Admin).
          </p>
        </div>
      )}

      <SettingsForm defaultValues={settings ?? undefined} onSubmit={handleSubmit} loading={saving} />
    </div>
  );
}
