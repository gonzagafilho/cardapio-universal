'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getEstablishments } from '@/services/establishment.service';
import { DataTable, type Column } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { AccessDenied } from '@/components/auth/AccessDenied';
import {
  canAccessEstablishments,
  canCreateEstablishments,
} from '@/lib/permissions';
import type { Establishment } from '@/types/establishment';

export default function EstablishmentsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  const canView = user ? canAccessEstablishments(user.role) : false;
  const canCreate = user ? canCreateEstablishments(user.role) : false;

  useEffect(() => {
    if (!user || !canView) {
      setLoading(false);
      return;
    }

    getEstablishments()
      .then(setList)
      .finally(() => setLoading(false));
  }, [user, canView]);

  if (!user) return null;

  if (loading) return <LoadingPage />;

  if (!canView) {
    return (
      <AccessDenied description="Seu perfil não pode acessar esta área." />
    );
  }

  const columns: Column<Establishment>[] = [
    { key: 'name', header: 'Nome' },
    { key: 'slug', header: 'Slug' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row: Establishment) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    ...(canCreate
      ? [
          {
            key: 'id' as const,
            header: '',
            render: (row: Establishment) => (
              <Link href={`/establishments/${row.id}`}>
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
              </Link>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meu restaurante</h1>

        {canCreate && (
          <Link href="/establishments/new">
            <Button>Novo estabelecimento</Button>
          </Link>
        )}
      </div>

      <DataTable<Establishment>
        columns={columns}
        data={list}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum estabelecimento cadastrado."
      />
    </div>
  );
}