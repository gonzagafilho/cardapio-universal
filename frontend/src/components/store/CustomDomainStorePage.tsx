'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useStoreDataByHost } from '@/hooks/useStoreData';
import { useCart } from '@/hooks/useCart';
import {
  StoreHeader,
  StoreBanner,
  CategoryTabs,
  ProductList,
  ProductModal,
  CartDrawer,
  StoreFooter,
} from '@/components/store';
import { LoadingPage } from '@/components/ui/loading';
import { DomainNotFound } from '@/components/store/DomainNotFound';
import { PwaRegister } from '@/components/PwaRegister';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import type { Product } from '@/types/product';

export function CustomDomainStorePage({ host }: { host: string }) {
  const { store, settings, categories, products, loading, error } =
    useStoreDataByHost(host);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const { setStore } = useCart();

    useEffect(() => {
    if (store) {
    setStore(store.slug, store.id);
    }
  }, [store, setStore]);

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

  if (loading) return <LoadingPage />;
  if (error || !store) {
    return (
      <DomainNotFound
        host={host || undefined}
        title="Domínio não encontrado"
        description={error ?? 'Este endereço não está vinculado a nenhum cardápio. Verifique o link ou acesse o site principal.'}
      />
    );
  }

  const linkBase = '';

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader
        store={store}
        storeSlug={store.slug}
        onCartClick={() => setCartOpen(true)}
        linkBase={linkBase}
      />
      <StoreBanner store={store} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant={openNow ? 'success' : 'warning'}>
            {openNow ? 'Aberto' : 'Fechado'}
          </Badge>
          {settings?.deliveryEstimate != null && (
            <span className="text-sm text-gray-600">
              Entrega: {settings.deliveryEstimate} min
            </span>
          )}
          {settings?.minimumOrder != null && Number(settings.minimumOrder) > 0 && (
            <span className="text-sm text-gray-600">
              Pedido min: {formatCurrency(Number(settings.minimumOrder))}
            </span>
          )}
        </div>
        {store.description && (
          <p className="mb-4 text-sm text-gray-600">{store.description}</p>
        )}
        <CategoryTabs
          categories={categories}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />
        <div className="mt-4">
          <ProductList
            products={filteredProducts}
            onProductClick={setSelectedProduct}
          />
        </div>
      </main>
      <StoreFooter store={store} />
      <ProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        storeSlug={store.slug}
        establishmentId={store.id}
      />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        storeSlug={store.slug}
        linkBase={linkBase}
      />
      <PwaRegister />
    </div>
  );
}
