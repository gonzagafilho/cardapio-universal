'use client';

import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { DataTable, type Column } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { formatCurrency } from '@/lib/currency';
import {
  canAccessProducts,
  canCreateProducts,
} from '@/lib/permissions';
import type { Product } from '@/types/product';

export default function ProductsPage() {
  const { user } = useAuth();

  const canView = user ? canAccessProducts(user.role) : false;
  const canCreate = user ? canCreateProducts(user.role) : false;

  const { products, loading } = useProducts(
    user && canView ? (user.establishmentId ?? undefined) : undefined
  );

  if (!user) return null;

  if (loading) return <LoadingPage />;

  if (!canView) {
    return <AccessDenied description="Seu perfil não pode acessar produtos." />;
  }

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Nome' },
    {
      key: 'price',
      header: 'Preço',
      render: (row: Product) => formatCurrency(Number(row.price)),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row: Product) => (
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
            render: (row: Product) => (
              <Link href={`/products/${row.id}`}>
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
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>

        {canCreate && (
          <Link href="/products/new">
            <Button>Novo produto</Button>
          </Link>
        )}
      </div>

      <DataTable<Product>
        columns={columns}
        data={products}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum produto."
      />
    </div>
  );
}