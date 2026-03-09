'use client';

import { getOrderStatusLabel } from '@/lib/format';
import type { OrderStatus } from '@/types/order';

const ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const idx = ORDER.indexOf(status);
  const isCancelled = status === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
        Pedido cancelado
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {ORDER.map((s, i) => {
        const done = i <= idx;
        return (
          <div key={s} className="flex gap-3">
            <div className={`h-4 w-4 shrink-0 rounded-full ${done ? 'bg-primary' : 'bg-gray-200'}`} />
            <p className={`text-sm ${done ? 'text-gray-900' : 'text-gray-500'}`}>
              {getOrderStatusLabel(s)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
