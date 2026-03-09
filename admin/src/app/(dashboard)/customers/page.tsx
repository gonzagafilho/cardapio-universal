'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getCustomers } from '@/services/customer.service';
import { DataTable } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import type { Customer } from '@/types/customer';

export default function CustomersPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers(user?.establishmentId ?? undefined).then(setList).finally(() => setLoading(false));
  }, [user?.establishmentId]);

  if (loading) return <LoadingPage />;

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'phone', header: 'Telefone' },
    { key: 'email', header: 'E-mail' },
    {
      key: 'id',
      header: '',
      render: (row: Customer) => (
        <Link href={`/customers/${row.id}`}><Button variant="ghost" size="sm">Ver</Button></Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
      <DataTable columns={columns} data={list} keyExtractor={(r) => r.id} emptyMessage="Nenhum cliente." />
    </div>
  );
}
