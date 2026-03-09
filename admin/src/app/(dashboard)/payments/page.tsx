'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getPayments } from '@/services/payment.service';
import { DataTable } from '@/components/tables';
import { LoadingPage } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/format';
import type { Payment } from '@/types/payment';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayments(user?.establishmentId ?? undefined).then(setList).finally(() => setLoading(false));
  }, [user?.establishmentId]);

  if (loading) return <LoadingPage />;

  const columns = [
    { key: 'method', header: 'Método' },
    { key: 'status', header: 'Status' },
    { key: 'amount', header: 'Valor', render: (row: Payment) => formatCurrency(Number(row.amount)) },
    { key: 'paidAt', header: 'Pago em', render: (row: Payment) => row.paidAt ? formatDateTime(row.paidAt) : '-' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
      <DataTable columns={columns} data={list} keyExtractor={(r) => r.id} emptyMessage="Nenhum pagamento." />
    </div>
  );
}
