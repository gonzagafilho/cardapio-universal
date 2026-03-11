'use client';

import Link from 'next/link';
import { useStoreDataByHost } from '@/hooks/useStoreData';
import { useCart } from '@/hooks/useCart';
import { StoreHeader, CartSummary, StoreFooter, DomainNotFound } from '@/components/store';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/currency';

const linkBase = '';

export function CustomDomainCartPage({ host }: { host: string }) {
  const { store, loading, error } = useStoreDataByHost(host);
  const {
    items,
    subtotal,
    discount,
    deliveryFee,
    total,
    updateQuantity,
    removeItem,
  } = useCart();

  if (loading) return <LoadingPage />;
  if (error || !store) {
    return <DomainNotFound host={host} description={error ?? undefined} />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <StoreHeader store={store} storeSlug={store.slug} linkBase={linkBase} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
          <EmptyState
            title="Carrinho vazio"
            description="Adicione itens no cardápio para continuar."
            action={
              <Link href={linkBase || '/'}>
                <Button className="rounded-xl bg-gray-900 hover:bg-gray-800">Ver cardápio</Button>
              </Link>
            }
          />
        </main>
        <StoreFooter store={store} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StoreHeader store={store} storeSlug={store.slug} linkBase={linkBase} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Seu carrinho</h1>
        <p className="mt-1 text-sm text-gray-500">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-card"
            >
              <div className="flex justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{item.product.name}</p>
                  {item.selectedOptions.length > 0 && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      {item.selectedOptions.map((o) => o.itemName).join(' · ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="mt-0.5 text-sm text-gray-500 italic">Obs: {item.notes}</p>
                  )}
                </div>
                <p className="shrink-0 font-semibold text-primary">
                  {formatCurrency(item.totalPrice)}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center rounded-xl border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="rounded-l-xl px-3 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="rounded-r-xl px-3 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
          <CartSummary
            subtotal={subtotal}
            discount={discount}
            deliveryFee={deliveryFee}
            total={total}
          />
        </div>
        <Link href={`${linkBase || '/'}/checkout`} className="mt-6 block">
          <Button fullWidth size="lg" className="rounded-xl bg-gray-900 hover:bg-gray-800">
            Continuar para checkout
          </Button>
        </Link>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
