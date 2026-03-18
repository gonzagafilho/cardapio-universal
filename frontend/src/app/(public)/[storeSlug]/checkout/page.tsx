'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStoreData } from '@/hooks/useStoreData';
import { useCart } from '@/hooks/useCart';
import {
  getOrCreateSessionId,
  syncPublicCart,
  getPublicCart,
  createPublicOrder,
  getPublicTableContext,
} from '@/services/store.service';
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
  const { items, subtotal, discount, deliveryFee, total, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const tableCtx = getPublicTableContext(storeSlug);
  const tableLabel =
    tableCtx?.tableNumber != null
      ? `Mesa ${tableCtx.tableNumber}`
      : tableCtx?.tableName ?? null;

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
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const sessionId = getOrCreateSessionId();
      await syncPublicCart(storeSlug, sessionId, items);
      const cart = await getPublicCart(storeSlug, sessionId);
      const result = await createPublicOrder(storeSlug, {
        sessionId,
        cartId: cart.id,
        type: data.orderType,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.orderType === 'delivery' ? data.deliveryAddress : undefined,
        notes: data.notes?.trim() || undefined,
        tableId: tableCtx?.tableId,
      });
      if (result?.order) {
        const o = result.order as { id: string; code?: string; totalAmount?: number; total?: number };
        goToSuccess(o.id, o.code ?? undefined, o.totalAmount ?? o.total);
      }
    } catch (err) {
      const raw = (err as { message?: string }).message ?? 'Erro ao criar pedido';
      const message =
        /inválido|já convertido|convertido/i.test(raw)
          ? 'Seu carrinho já foi utilizado ou expirou. Volte ao cardápio e monte o pedido novamente.'
          : raw;
      setSubmitError(message);
    } finally {
      setSubmitting(false);
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
        {tableLabel && (
          <div className="mt-4 rounded-lg bg-neutral-100 p-3 text-sm text-neutral-900">
            🪑 Você está fazendo pedido para <strong>{tableLabel}</strong>
          </div>
        )}
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card lg:p-6">
            <h2 className="text-lg font-semibold text-gray-900">Seus dados</h2>
            <CheckoutFormSimple
              defaultData={tableCtx ? { orderType: 'dine_in' } : undefined}
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
