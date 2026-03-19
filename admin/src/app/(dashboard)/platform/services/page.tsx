'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { LoadingPage } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/tables';
import { canAccessPlatform } from '@/lib/permissions';
import { getServiceCatalog } from '@/services/master-services.service';
import type { ServiceCatalogItem } from '@/types/master-services';

export default function PlatformServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const canView = user ? canAccessPlatform(user.role) : false;

  useEffect(() => {
    if (!user || !canView) {
      setLoading(false);
      return;
    }
    getServiceCatalog()
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [user, canView]);

  if (!user) return null;
  if (loading) return <LoadingPage />;
  if (!canView) {
    return <AccessDenied description="Acesso restrito à plataforma. Apenas Super Admin." />;
  }

  const columns: Column<ServiceCatalogItem>[] = [
    { key: 'name', header: 'Serviço' },
    { key: 'key', header: 'Key' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'error'}>
          {row.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: '_count',
      header: 'Vínculos',
      render: (row) => row._count?.tenantBindings ?? 0,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plataforma — Catálogo de serviços</h1>
        <p className="mt-1 text-sm text-gray-600">
          Serviços globais disponíveis para vinculação por tenant.
        </p>
      </div>
      <DataTable<ServiceCatalogItem>
        columns={columns}
        data={services}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum serviço cadastrado."
      />
    </div>
  );
}
