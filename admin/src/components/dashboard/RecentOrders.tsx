'use client';

import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="font-semibold text-gray-900">Últimos pedidos</h3>
        <Link href="/orders" className="text-sm text-primary hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data.slice(0, 5).map((o) => (
            <li key={o.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
              <Link href={`/orders/${o.id}`} className="font-medium text-primary hover:underline">
                #{o.code}
              </Link>
              <span className="text-sm text-gray-600">{formatCurrency(o.total)}</span>
              <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
              <span className="text-xs text-gray-400">{formatDateTime(o.createdAt)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
