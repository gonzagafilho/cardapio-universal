'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStoreData } from '@/hooks/useStoreData';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { StoreHeader, CheckoutFormSimple, CartSummary, StoreFooter } from '@/components/store';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/currency';
import type { CheckoutFormSimpleData } from '@/components/store/CheckoutFormSimple';

interface PageProps {
  params: { storeSlug: string };
}

export default function CheckoutPage({ params }: PageProps) {
  const { storeSlug } = params;
  const router = useRouter();
  const { store, settings, loading, error } = useStoreData(storeSlug);
  const { items, establishmentId, subtotal, discount, deliveryFee, total, clearCart } = useCart();
  const { submitOrder, loading: submitting, error: submitError } = useCheckout();

  const minDelivery =
    settings?.minimumOrderDelivery != null
      ? Number(settings.minimumOrderDelivery)
      : settings?.minimumOrder != null
        ? Number(settings.minimumOrder)
        : null;

  const goToSuccess = (orderId: string, orderCode?: string, orderTotal?: number) => {
    clearCart();
    const qs = new URLSearchParams({ orderId });
    if (orderCode) qs.set('code', orderCode);
    if (orderTotal != null) qs.set('total', String(orderTotal));
    router.push(`/${storeSlug}/success?${qs.toString()}`);
  };

  const handleSubmit = async (data: CheckoutFormSimpleData) => {
    try {
      const result = await submitOrder({
        establishmentId: establishmentId ?? '',
        cartId: '',
        type: data.orderType,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.orderType === 'delivery' ? data.deliveryAddress : undefined,
        notes: data.notes?.trim() || undefined,
      });
      if (result) {
        const raw = result as { total?: number; totalAmount?: number };
        const totalAmount = typeof raw.total === 'number' ? raw.total : typeof raw.totalAmount === 'number' ? raw.totalAmount : total;
        goToSuccess(result.id, result.code, totalAmount);
      }
    } catch {
      // error in useCheckout
    }
  };

  if (loading) return <LoadingPage />;
  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <EmptyState title="Loja não encontrada" description={error ?? undefined} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <StoreHeader store={store} storeSlug={storeSlug} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
          <EmptyState
            title="Carrinho vazio"
            description="Adicione itens antes de finalizar."
            action={
              <Link href={`/${storeSlug}/cart`}>
                <Button className="rounded-xl bg-gray-900 hover:bg-gray-800">Ver carrinho</Button>
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
      <StoreHeader store={store} storeSlug={storeSlug} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
        <p className="mt-1 text-sm text-gray-500">Preencha seus dados e confirme o pedido.</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card lg:p-6">
            <h2 className="text-lg font-semibold text-gray-900">Seus dados</h2>
            <CheckoutFormSimple
              onSubmit={handleSubmit}
              loading={submitting}
              error={submitError}
            />
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
              <h2 className="font-semibold text-gray-900">Resumo do pedido</h2>
              {minDelivery != null && (
                <p className="mt-1 text-sm text-gray-500">
                  Pedido mínimo para entrega: {formatCurrency(minDelivery)}
                </p>
              )}
              <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2 text-sm">
                    <span className="text-gray-700">
                      {item.quantity}x {item.product.name}
                      {item.selectedOptions.length > 0 && (
                        <span className="text-gray-500"> · {item.selectedOptions.map((o) => o.itemName).join(', ')}</span>
                      )}
                    </span>
                    <span className="font-medium text-gray-900 shrink-0">{formatCurrency(item.totalPrice)}</span>
                  </li>
                ))}
              </ul>
              <CartSummary
                subtotal={subtotal}
                discount={discount}
                deliveryFee={deliveryFee}
                total={total}
              />
            </div>
          </div>
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
