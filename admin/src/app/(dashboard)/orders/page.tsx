'use client';

import Link from 'next/link';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { DataTable, type Column } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { OrderStatusBadge } from '@/components/orders';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/format';
import type { Order } from '@/types/order';

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders, loading } = useOrders(user?.establishmentId ?? undefined);

  if (loading) return <LoadingPage />;

  const columns: Column<Order>[] = [
    {
      key: 'code',
      header: 'Código',
      render: (row: Order) => {
        const tableLabel =
          row.table?.number != null
            ? `Mesa ${row.table.number}`
            : row.table?.name ?? null;
        return (
          <div className="space-y-1">
            <div className="font-mono font-semibold text-gray-900">
              {row.code ?? row.orderNumber ?? row.id.slice(0, 8)}
            </div>
            {tableLabel && (
              <div className="text-sm font-medium text-sky-900">
                🪑 {tableLabel}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'total',
      header: 'Total',
      render: (row: Order) => formatCurrency(Number(row.total)),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Order) => <OrderStatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Data',
      render: (row: Order) => formatDateTime(row.createdAt),
    },
    {
      key: 'id',
      header: '',
      render: (row: Order) => (
        <Link href={`/orders/${row.id}`}>
          <Button variant="ghost" size="sm">Ver</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
      <DataTable<Order> columns={columns} data={orders} keyExtractor={(row) => row.id} emptyMessage="Nenhum pedido." />
    </div>
  );
}
