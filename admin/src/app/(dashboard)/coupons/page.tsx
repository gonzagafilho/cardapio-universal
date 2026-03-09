'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getCoupons } from '@/services/coupon.service';
import { DataTable } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import type { Coupon } from '@/types/coupon';

export default function CouponsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = user?.establishmentId;
    getCoupons(id ?? undefined).then(setList).finally(() => setLoading(false));
  }, [user?.establishmentId]);

  if (loading) return <LoadingPage />;

  const columns = [
    { key: 'code', header: 'Código' },
    { key: 'type', header: 'Tipo' },
    { key: 'value', header: 'Valor' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row: Coupon) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>{row.isActive ? 'Ativo' : 'Inativo'}</Badge>
      ),
    },
    {
      key: 'id',
      header: '',
      render: (row: Coupon) => (
        <Link href={`/coupons/${row.id}`}><Button variant="ghost" size="sm">Editar</Button></Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cupons</h1>
        <Link href="/coupons/new"><Button>Novo cupom</Button></Link>
      </div>
      <DataTable columns={columns} data={list} keyExtractor={(r) => r.id} emptyMessage="Nenhum cupom." />
    </div>
  );
}
