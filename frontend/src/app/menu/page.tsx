'use client';

import { Suspense, useMemo, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStoreData } from '@/hooks/useStoreData';
import { useCart } from '@/hooks/useCart';
import {
  StoreHeader,
  StoreBanner,
  CategoryTabs,
  ProductList,
  CartDrawer,
  StoreFooter,
} from '@/components/store';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { DEFAULT_STORE_SLUG } from '@/lib/constants';
import type { Product } from '@/types/product';

function MenuPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeSlug = searchParams.get('store')?.trim() || DEFAULT_STORE_SLUG;
  const { store, settings, categories, products, loading, error } = useStoreData(storeSlug || null);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { setStore } = useCart();
  if (store) setStore(storeSlug, store.id);

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return products;
    return products.filter((p) => p.categoryId === activeCategoryId);
  }, [products, activeCategoryId]);

  const isOpen = useCallback(() => {
    if (!settings?.openHours) return true;
    const now = new Date();
    const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
    const hours = settings.openHours[day];
    if (!hours) return false;
    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    const current = now.getHours() * 60 + now.getMinutes();
    const open = openH * 60 + openM;
    const close = closeH * 60 + closeM;
    return current >= open && current <= close;
  }, [settings?.openHours]);

  const openNow = settings?.openHours ? isOpen() : true;

  if (!storeSlug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <EmptyState
          title="Loja não configurada"
          description="Defina NEXT_PUBLIC_STORE_SLUG ou use ?store=slug na URL."
        />
      </div>
    );
  }

  if (loading) return <LoadingPage />;
  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <EmptyState
          title="Loja não encontrada"
          description={error ?? 'Verifique o link e tente novamente.'}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StoreHeader
        store={store}
        storeSlug={storeSlug}
        onCartClick={() => setCartOpen(true)}
        linkBase={`/menu?store=${encodeURIComponent(storeSlug)}`}
      />
      <StoreBanner store={store} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Badge variant={openNow ? 'success' : 'warning'}>
            {openNow ? 'Aberto' : 'Fechado'}
          </Badge>
          {settings?.deliveryEstimate != null && (
            <span className="text-sm text-gray-500">
              Entrega: {settings.deliveryEstimate} min
            </span>
          )}
          {settings?.minimumOrder != null && Number(settings.minimumOrder) > 0 && (
            <span className="text-sm text-gray-500">
              Pedido mín.: {formatCurrency(Number(settings.minimumOrder))}
            </span>
          )}
        </div>
        {store.description && (
          <p className="mb-5 text-sm text-gray-600">{store.description}</p>
        )}
        <CategoryTabs
          categories={categories}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />
        <div className="mt-6">
          <ProductList
            products={filteredProducts}
            onProductClick={(product: Product) => {
              router.push(`/product/${product.id}?store=${encodeURIComponent(storeSlug)}`);
            }}
          />
        </div>
      </main>
      <StoreFooter store={store} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        storeSlug={storeSlug}
        linkBase={`/menu?store=${encodeURIComponent(storeSlug)}`}
        cartHref={`/${storeSlug}/cart`}
      />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <MenuPageContent />
    </Suspense>
  );
}
