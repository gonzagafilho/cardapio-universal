'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { DataTable, type Column } from '@/components/tables';
import { canAccessPlatform } from '@/lib/permissions';
import { getTenantServices } from '@/services/master-services.service';
import type {
  TenantServiceBindingItem,
  TenantServicesResponse,
} from '@/types/master-services';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('pt-BR', {
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

export default function PlatformTenantServicesPage() {
  const { user } = useAuth();
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [data, setData] = useState<TenantServicesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const canView = user ? canAccessPlatform(user.role) : false;

  useEffect(() => {
    if (!user || !canView) {
      setLoading(false);
      return;
    }
    getTenantServices(tenantId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user, canView, tenantId]);

  if (!user) return null;
  if (loading) return <LoadingPage />;
  if (!canView) {
    return <AccessDenied description="Acesso restrito à plataforma. Apenas Super Admin." />;
  }

  const bindings = data?.bindings ?? [];
  const tenant = data?.tenant;

  const columns: Column<TenantServiceBindingItem>[] = [
    {
      key: 'service',
      header: 'Serviço',
      render: (row) => row.service.name,
    },
    {
      key: 'serviceKey',
      header: 'Key',
      render: (row) => row.service.key,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'activatedAt',
      header: 'Ativado em',
      render: (row) => formatDate(row.activatedAt),
    },
    {
      key: 'updatedAt',
      header: 'Atualizado em',
      render: (row) => formatDate(row.updatedAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/platform/tenants">
          <Button variant="ghost" size="sm">
            Voltar
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          {tenant?.name ?? 'Tenant não encontrado'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Slug: <span className="font-medium">{tenant?.slug ?? '—'}</span>
        </p>
      </div>

      <DataTable<TenantServiceBindingItem>
        columns={columns}
        data={bindings}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum serviço vinculado para este tenant."
      />
    </div>
  );
}
