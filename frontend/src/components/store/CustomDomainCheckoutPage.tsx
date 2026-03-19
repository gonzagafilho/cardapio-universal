'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStoreDataByHost } from '@/hooks/useStoreData';
import { useCart } from '@/hooks/useCart';
import {
  getOrCreateSessionId,
  syncPublicCart,
  getPublicCart,
  createPublicOrder,
  getPublicTableByToken,
  getPublicTableContext,
  setPublicTableContext,
} from '@/services/store.service';
import { StoreHeader, CheckoutForm, CartSummary, StoreFooter, DomainNotFound } from '@/components/store';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

const linkBase = '';

export function CustomDomainCheckoutPage({ host }: { host: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { store, loading, error } = useStoreDataByHost(host);
  const { items, subtotal, discount, deliveryFee, total, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const tableCtx = store ? getPublicTableContext(store.slug) : null;
  const tableLabel =
    tableCtx?.tableNumber != null
      ? `Mesa ${tableCtx.tableNumber}`
      : tableCtx?.tableName ?? null;

  useEffect(() => {
    if (!store) return;
    const token = (searchParams?.get('table') ?? '').trim();
    if (!token) return;

    getPublicTableByToken(store.slug, token)
      .then((table) => {
        setPublicTableContext({
          slug: store.slug,
          token,
          tableId: table.id,
          tableName: table.name,
          tableNumber: table.number ?? null,
          resolvedAt: Date.now(),
        });
      })
      .catch(() => {
        // fluxo segue sem contexto de mesa quando token inválido
      });
  }, [searchParams, store]);

  const handleSubmit = async (data: import('@/components/store/CheckoutForm').CheckoutFormData) => {
    if (!store || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fullAddress = data.orderType === 'delivery'
        ? `${data.deliveryAddress}, ${data.addressNumber}${data.complement ? ` - ${data.complement}` : ''} - ${data.neighborhood}${data.reference ? ` (${data.reference})` : ''}`
        : undefined;
      const sessionId = getOrCreateSessionId();
      await syncPublicCart(store.slug, sessionId, items);
      const cart = await getPublicCart(store.slug, sessionId);
      const result = await createPublicOrder(store.slug, {
        sessionId,
        cartId: cart.id,
        type: data.orderType,
        paymentMethod: data.paymentMethod,
        notes: data.notes?.trim() || undefined,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: fullAddress,
        tableId: data.orderType === 'dine_in' ? tableCtx?.tableId : undefined,
        tableToken: data.orderType === 'dine_in' ? tableCtx?.token : undefined,
      });
      if (result?.order) {
        clearCart();
        const o = result.order as { id: string; code?: string; totalAmount?: number; total?: number };
        const qs = new URLSearchParams({ orderId: o.id });
        if (o.code) qs.set('code', o.code);
        if (o.totalAmount != null || o.total != null) qs.set('total', String(o.totalAmount ?? o.total));
        router.push(`/success?${qs.toString()}`);
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
    return <DomainNotFound host={host} description={error ?? undefined} />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader store={store} storeSlug={store.slug} linkBase={linkBase} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          <EmptyState
            title="Carrinho vazio"
            description="Adicione itens antes de finalizar."
            action={
              <Link href="/">
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
      <StoreHeader store={store} storeSlug={store.slug} linkBase={linkBase} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
        {tableLabel && (
          <div className="mt-4 rounded-lg bg-neutral-100 p-3 text-sm text-neutral-900">
            🪑 Você está fazendo pedido para <strong>{tableLabel}</strong>
          </div>
        )}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <CheckoutForm
              defaultData={tableCtx ? { orderType: 'dine_in' } : undefined}
              onSubmit={handleSubmit}
              loading={submitting}
              error={submitError}
            />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-gray-900">Resumo do pedido</h2>
            <CartSummary subtotal={subtotal} discount={discount} deliveryFee={deliveryFee} total={total} />
          </div>
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
