'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { OrderStatusBadge } from '@/components/orders';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime, getOrderStatusLabel } from '@/lib/format';
import { API_BASE_URL } from '@/lib/constants';
import { updateOrderStatus } from '@/services/order.service';
import type { Order, OrderStatus } from '@/types/order';

const WS_ORIGIN =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_WS_URL ?? new URL(API_BASE_URL).origin)
    : '';

const COZINHA_STATUS_ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED',
];

const NEXT_ACTIONS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }[]>> = {
  PENDING: [
    { status: 'CONFIRMED', label: 'Confirmar' },
    { status: 'CANCELLED', label: 'Cancelar' },
  ],
  CONFIRMED: [
    { status: 'PREPARING', label: 'Preparar' },
    { status: 'CANCELLED', label: 'Cancelar' },
  ],
  PREPARING: [{ status: 'READY', label: 'Pronto' }],
  READY: [{ status: 'OUT_FOR_DELIVERY', label: 'Saiu p/ entrega' }],
  OUT_FOR_DELIVERY: [{ status: 'COMPLETED', label: 'Concluído' }],
};

function orderTotal(order: Order): number {
  return Number(order.total ?? (order as { totalAmount?: number }).totalAmount ?? 0);
}

function OrderCard({
  order,
  onAction,
  loadingId,
}: {
  order: Order;
  onAction: (id: string, status: OrderStatus) => void;
  loadingId: string | null;
}) {
  const code = order.code ?? order.orderNumber ?? order.id.slice(0, 8);
  const actions = NEXT_ACTIONS[order.status as OrderStatus] ?? [];
  const loading = loadingId === order.id;
  const tableLabel =
    order.table?.number != null
      ? `Mesa ${order.table.number}`
      : order.table?.name != null
        ? `Mesa ${order.table.name}`
        : null;

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        tableLabel ? 'border-sky-200 bg-sky-50/30' : 'border-gray-200'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="font-mono text-lg font-semibold text-gray-900">#{code}</span>
          <span className="ml-2 text-sm text-gray-500">
            {formatDateTime(order.createdAt)}
          </span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-gray-700">
        {order.customerName ?? '—'}
        {order.customerPhone ? ` · ${order.customerPhone}` : ''}
      </p>
      {tableLabel && (
        <div className="mt-2 text-sm font-medium text-sky-900">
          🪑 {tableLabel}
        </div>
      )}
      {order.items && order.items.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm text-gray-600">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.quantity}x {item.productName}
              {item.notes ? ` (${item.notes})` : ''}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        <span className="font-semibold text-gray-900">
          {formatCurrency(orderTotal(order))}
        </span>
        {actions.map(({ status, label }) => (
          <Button
            key={status}
            size="sm"
            variant={status === 'CANCELLED' ? 'danger' : 'primary'}
            disabled={loading}
            onClick={() => onAction(order.id, status)}
          >
            {label}
          </Button>
        ))}
      </div>
    </article>
  );
}

export default function CozinhaPage() {
  const { user } = useAuth();
  const establishmentId = user?.establishmentId ?? undefined;
  const { orders, loading, refetch } = useOrders(establishmentId);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!establishmentId || typeof window === 'undefined' || !WS_ORIGIN) return;

    const socket = io(WS_ORIGIN, { path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('subscribe', { establishmentId });

    const onEvent = () => {
      refetch();
    };

    socket.on('order.created', onEvent);
    socket.on('order.confirmed', onEvent);
    socket.on('order.status_changed', onEvent);

    return () => {
      socket.off('order.created', onEvent);
      socket.off('order.confirmed', onEvent);
      socket.off('order.status_changed', onEvent);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [establishmentId, refetch]);

  const handleAction = async (orderId: string, status: OrderStatus) => {
    setActionLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      await refetch();
    } catch {
      // erro já pode ser tratado por um toast futuro
    } finally {
      setActionLoadingId(null);
    }
  };

  const ordersByStatus = COZINHA_STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status);
      return acc;
    },
    {} as Record<OrderStatus, Order[]>,
  );

  if (!establishmentId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <p className="font-medium">Cozinha</p>
        <p className="text-sm">
          Conecte-se com um usuário vinculado a um estabelecimento para ver os pedidos em tempo real.
        </p>
      </div>
    );
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cozinha</h1>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Tempo real ativo
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 py-12 text-center text-gray-500">
          Nenhum pedido no momento.
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {COZINHA_STATUS_ORDER.map((status) => {
            const list = ordersByStatus[status] ?? [];
            if (list.length === 0) return null;
            return (
              <section key={status} className="space-y-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  <span>{getOrderStatusLabel(status)}</span>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                    {list.length}
                  </span>
                </h2>
                <ul className="space-y-3">
                  {list.map((order) => (
                    <li key={order.id}>
                      <OrderCard
                        order={order}
                        onAction={handleAction}
                        loadingId={actionLoadingId}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
