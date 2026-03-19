'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { LoadingPage } from '@/components/ui/loading';
import { canAccessPlatform } from '@/lib/permissions';
import { getPlatformOverview } from '@/services/master-services.service';
import type { PlatformOverview } from '@/types/master-services';

export default function PlatformPage() {
  const { user } = useAuth();
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const canView = user ? canAccessPlatform(user.role) : false;

  useEffect(() => {
    if (!user || !canView) {
      setLoading(false);
      return;
    }
    getPlatformOverview()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user, canView]);

  if (!user) return null;
  if (loading) return <LoadingPage />;
  if (!canView) {
    return <AccessDenied description="Acesso restrito à plataforma. Apenas Super Admin." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Plataforma</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
          Painel mestre
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Visão de leitura do catálogo global, tenants e vínculos por serviço.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Tenants</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{data?.tenantsTotal ?? 0}</p>
          <p className="mt-1 text-sm text-gray-600">Ativos: {data?.tenantsActive ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Serviços</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{data?.servicesTotal ?? 0}</p>
          <p className="mt-1 text-sm text-gray-600">Ativos: {data?.servicesActive ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Vínculos</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{data?.bindingsTotal ?? 0}</p>
          <p className="mt-1 text-sm text-gray-600">Tenant x Serviço</p>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <Link
          href="/platform/services"
          className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Ver catálogo de serviços
        </Link>
        <Link
          href="/platform/tenants"
          className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Ver tenants e vínculos
        </Link>
      </section>
    </div>
  );
}
