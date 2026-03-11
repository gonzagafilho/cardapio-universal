'use client';

import Link from 'next/link';
import { useStoreDataByHost } from '@/hooks/useStoreData';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { StoreHeader, OrderTimeline, StoreFooter, DomainNotFound } from '@/components/store';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/currency';
import { getOrderStatusLabel } from '@/lib/format';

const linkBase = '';

export function CustomDomainOrderPage({ host, orderId }: { host: string; orderId: string }) {
  const { store, loading: storeLoading, error: storeError } = useStoreDataByHost(host);
  const { order, loading: orderLoading, error: orderError } = useOrderTracking(orderId);

  if (storeLoading) return <LoadingPage />;
  if (storeError || !store) return <DomainNotFound host={host} description={storeError ?? undefined} />;

  if (orderLoading) return <LoadingPage />;
  if (orderError || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader store={store} storeSlug={store.slug} linkBase={linkBase} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          <EmptyState
            title="Pedido não encontrado"
            description={orderError ?? undefined}
            action={
              <Link href={linkBase || '/'}>
                <Button>Voltar ao cardápio</Button>
              </Link>
            }
          />
        </main>
        <StoreFooter store={store} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader store={store} storeSlug={store.slug} linkBase={linkBase} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900">Acompanhar pedido</h1>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-lg font-semibold text-primary">Pedido #{order.code}</p>
          <p className="text-sm text-gray-600">Status: {getOrderStatusLabel(order.status)}</p>
          <p className="mt-2 text-gray-700">Total: {formatCurrency(Number(order.total))}</p>
        </div>
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-4 font-semibold text-gray-900">Timeline</h2>
          <OrderTimeline status={order.status} />
        </div>
        {order.items && order.items.length > 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Itens</h2>
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
        <div className="mt-6">
          <Link href={linkBase || '/'}>
            <Button variant="outline" fullWidth>Voltar ao cardápio</Button>
          </Link>
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
