'use client';

import { getOrderStatusLabel } from '@/lib/format';
import type { OrderStatus } from '@/types/order';

const STATUS_ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export interface OrderTimelineProps {
  status: OrderStatus;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const isCancelled = status === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
        <p className="font-medium">Pedido cancelado</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {STATUS_ORDER.map((s, i) => {
        const done = i <= currentIndex;
        const isLast = i === STATUS_ORDER.length - 1;
        return (
          <div key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-4 w-4 shrink-0 rounded-full ${
                  done ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] ${
                    done ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
            <div className="pb-6">
              <p
                className={`text-sm font-medium ${
                  done ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {getOrderStatusLabel(s)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
