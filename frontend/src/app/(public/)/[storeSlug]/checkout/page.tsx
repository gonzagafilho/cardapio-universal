'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStoreData } from '@/hooks/useStoreData';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { StoreHeader, CheckoutForm, CartSummary, StoreFooter } from '@/components/store';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

interface PageProps {
  params: { storeSlug: string };
}

export default function CheckoutPage({ params }: PageProps) {
  const { storeSlug } = params;
  const router = useRouter();
  const { store, loading, error } = useStoreData(storeSlug);
  const { items, establishmentId, subtotal, discount, deliveryFee, total } = useCart();
  const { submitOrder, loading: submitting, error: submitError, order } = useCheckout();

  const handleSubmit = async (data: import('@/components/store/CheckoutForm').CheckoutFormData) => {
    try {
      const fullAddress = data.orderType === 'delivery'
        ? `${data.deliveryAddress}, ${data.addressNumber}${data.complement ? ` - ${data.complement}` : ''} - ${data.neighborhood}${data.reference ? ` (${data.reference})` : ''}`
        : undefined;
      const result = await submitOrder({
        establishmentId: establishmentId ?? '',
        cartId: '',
        type: data.orderType,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: fullAddress,
      });
      if (result) {
        router.push(`/${storeSlug}/success?orderId=${result.id}`);
      }
    } catch {
      // error in useCheckout
    }
  };

  if (loading) return <LoadingPage />;
  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <EmptyState title="Loja nao encontrada" description={error ?? undefined} />
      </div>
    );
  }

  if (items.length === 0 && !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader store={store} storeSlug={storeSlug} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          <EmptyState
            title="Carrinho vazio"
            description="Adicione itens antes de finalizar."
            action={
              <Link href={`/${storeSlug}`}>
                <Button>Ver cardapio</Button>
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
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <CheckoutForm
              onSubmit={handleSubmit}
              loading={submitting}
              error={submitError}
            />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-gray-900">Resumo do pedido</h2>
            <CartSummary
              subtotal={subtotal}
              discount={discount}
              deliveryFee={deliveryFee}
              total={total}
            />
          </div>
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
