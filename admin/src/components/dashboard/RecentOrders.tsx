'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/format';

interface Order {
  id: string;
  code: string;
  total: number;
  status: string;
  createdAt: string;
}

export function RecentOrders({ data }: { data: Order[] }) {
  const statusVariant = (s: string) =>
    s === 'CANCELLED' ? 'error' : s === 'DELIVERED' ? 'success' : 'default';

  const orders = data.slice(0, 5);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      {/* header */}
      <div className="mb-6 flex items-center justify-between">

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Operação
          </p>

          <h3 className="mt-1 text-lg font-semibold text-gray-900">
            Últimos pedidos
          </h3>
        </div>

        <Link
          href="/orders"
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          Ver todos
        </Link>

      </div>

      {/* list */}
      <ul className="space-y-4">

        {orders.map((o) => (
          <li
            key={o.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition hover:bg-gray-50"
          >

            {/* order */}
            <Link
              href={`/orders/${o.id}`}
              className="font-medium text-gray-900 hover:underline"
            >
              #{o.code}
            </Link>

            {/* value */}
            <span className="text-sm font-medium text-gray-700">
              {formatCurrency(o.total)}
            </span>

            {/* status */}
            <Badge variant={statusVariant(o.status)}>
              {o.status}
            </Badge>

            {/* date */}
            <span className="text-xs text-gray-500">
              {formatDateTime(o.createdAt)}
            </span>

          </li>
        ))}

      </ul>

    </div>
  );
}