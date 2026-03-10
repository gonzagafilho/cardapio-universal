'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getTenants } from '@/services/tenant.service';
import { DataTable, type Column } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessPlatform } from '@/lib/permissions';
import type { Tenant } from '@/types/tenant';

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '—';
  }
}

export default function PlatformTenantsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const canView = user ? canAccessPlatform(user.role) : false;

  useEffect(() => {
    if (!user || !canView) {
      setLoading(false);
      return;
    }
    getTenants()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [user, canView]);

  if (!user) return null;
  if (loading) return <LoadingPage />;
  if (!canView) {
    return (
      <AccessDenied description="Acesso restrito à plataforma. Apenas Super Admin." />
    );
  }

  const columns: Column<Tenant>[] = [
    { key: 'name', header: 'Nome' },
    { key: 'slug', header: 'Slug' },
    {
      key: 'plan',
      header: 'Plano',
      render: (row: Tenant) => (
        <span className="capitalize">{row.plan ?? 'basic'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Tenant) => {
        const status = row.status ?? 'active';
        const variant = status === 'active' ? 'success' : 'error';
        return (
          <Badge variant={variant}>
            {status === 'active' ? 'Ativo' : status === 'suspended' ? 'Suspenso' : status}
          </Badge>
        );
      },
    },
    {
      key: '_count',
      header: 'Estab.',
      render: (row: Tenant) => row._count?.establishments ?? '—',
    },
    {
      key: '_count_users',
      header: 'Usuários',
      render: (row: Tenant) => row._count?.users ?? '—',
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      render: (row: Tenant) => formatDate(row.createdAt),
    },
    {
      key: 'id',
      header: '',
      render: (row: Tenant) => (
        <Link href={`/platform/tenants/${row.id}`}>
          <Button variant="ghost" size="sm">
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Plataforma — Tenants</h1>
      </div>
      <p className="text-sm text-gray-600">
        Visão global dos tenants cadastrados. Apenas Super Admin.
      </p>
      <DataTable<Tenant>
        columns={columns}
        data={list}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum tenant cadastrado."
      />
    </div>
  );
}
