'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreData } from '@/hooks/useStoreData';
import { useCart } from '@/hooks/useCart';
import {
  StoreHeader,
  CartSummary,
  StoreFooter,
} from '@/components/store';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/currency';

interface PageProps {
  params: { storeSlug: string };
}

export default function CartPage({ params }: PageProps) {
  const { storeSlug } = params;
  const router = useRouter();
  const { store, loading, error } = useStoreData(storeSlug);
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
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <EmptyState title="Loja não encontrada" description={error ?? undefined} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader store={store} storeSlug={storeSlug} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          <EmptyState
            title="Carrinho vazio"
            description="Adicione itens no cardápio para continuar."
            action={
              <Link href={`/${storeSlug}`}>
                <Button>Ver cardápio</Button>
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
      <StoreHeader store={store} storeSlug={storeSlug} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900">Seu carrinho</h1>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  {item.selectedOptions.length > 0 && (
                    <p className="text-sm text-gray-500">
                      {item.selectedOptions.map((o) => o.itemName).join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-gray-500">Obs: {item.notes}</p>
                  )}
                </div>
                <p className="font-medium text-primary">
                  {formatCurrency(item.totalPrice)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center rounded border border-gray-300">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 text-gray-600"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 text-gray-600"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <CartSummary
            subtotal={subtotal}
            discount={discount}
            deliveryFee={deliveryFee}
            total={total}
          />
        </div>
        <Link href={`/${storeSlug}/checkout`} className="mt-4 block">
          <Button fullWidth size="lg">
            Continuar para checkout
          </Button>
        </Link>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
