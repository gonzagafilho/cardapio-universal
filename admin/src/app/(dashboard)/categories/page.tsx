'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getCategories } from '@/services/category.service';
import { DataTable, type Column } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { AccessDenied } from '@/components/auth/AccessDenied';
import {
  canAccessCategories,
  canCreateCategories,
} from '@/lib/permissions';
import type { Category } from '@/types/category';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const canView = user ? canAccessCategories(user.role) : false;
  const canCreate = user ? canCreateCategories(user.role) : false;

  useEffect(() => {
    if (!user || !canView) {
      setLoading(false);
      return;
    }

    getCategories(user.establishmentId ?? undefined)
      .then(setList)
      .finally(() => setLoading(false));
  }, [user, canView]);

  if (!user) return null;

  if (loading) return <LoadingPage />;

  if (!canView) {
    return <AccessDenied description="Seu perfil não pode acessar categorias." />;
  }

  const columns: Column<Category>[] = [
    { key: 'name', header: 'Nome' },
    { key: 'description', header: 'Descrição' },
    { key: 'sortOrder', header: 'Ordem' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row: Category) => (
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
            render: (row: Category) => (
              <Link href={`/categories/${row.id}`}>
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
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>

        {canCreate && (
          <Link href="/categories/new">
            <Button>Nova categoria</Button>
          </Link>
        )}
      </div>

      <DataTable<Category>
        columns={columns}
        data={list}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhuma categoria."
      />
    </div>
  );
}