'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrder, updateOrderStatus } from '@/services/order.service';
import { OrderDetailsCard, OrderTimeline } from '@/components/orders';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { LoadingPage } from '@/components/ui/loading';
import { ORDER_STATUS_OPTIONS } from '@/lib/constants';
import { formatCurrency } from '@/lib/currency';
import type { Order } from '@/types/order';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then(setOrder)
      .catch(() => router.push('/orders'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleStatusChange = async (status: string) => {
    if (!order) return;
    const updated = await updateOrderStatus(order.id, status);
    setOrder(updated);
  };

  if (loading || !order) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/orders">
          <Button variant="ghost" size="sm">Voltar</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.code}</h1>
      </div>
      <OrderDetailsCard order={order} />
      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 font-semibold">Status</h2>
        <OrderTimeline status={order.status} />
        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <div className="mt-4 flex gap-2">
            <Select
              label="Alterar status"
              options={ORDER_STATUS_OPTIONS}
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            />
          </div>
        )}
      </div>
      {order.items && order.items.length > 0 && (
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 font-semibold">Itens</h2>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.productName}</span>
                <span>{formatCurrency(Number(item.totalPrice))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
