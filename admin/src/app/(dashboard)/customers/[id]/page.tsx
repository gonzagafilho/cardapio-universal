'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCustomer, getCustomerOrders } from '@/services/customer.service';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/format';
import type { Customer } from '@/types/customer';
import type { Order } from '@/types/order';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCustomer(id), getCustomerOrders(id)])
      .then(([c, o]) => {
        setCustomer(c);
        setOrders(o ?? []);
      })
      .catch(() => router.push('/customers'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !customer) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/customers">
          <Button variant="ghost" size="sm">Voltar</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <p><span className="text-gray-500">Telefone:</span> {customer.phone}</p>
        <p><span className="text-gray-500">E-mail:</span> {customer.email ?? '-'}</p>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 font-semibold">Histórico de pedidos</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum pedido.</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between text-sm">
                <span>#{o.code} - {formatDateTime(o.createdAt)}</span>
                <span>{formatCurrency(Number(o.total))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
