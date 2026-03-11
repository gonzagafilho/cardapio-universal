'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getStoreBySlug, getStoreProduct } from '@/services/store.service';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/currency';
import { DEFAULT_STORE_SLUG } from '@/lib/constants';
import type { Store } from '@/types/store';
import type { Product, ProductOptionGroup, ProductOptionItem } from '@/types/product';
import type { SelectedOption } from '@/types/cart';

function ProductPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = params.slug as string;
  const storeSlug = searchParams.get('store')?.trim() || DEFAULT_STORE_SLUG;

  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  const { addItem, setStore: setStoreCart } = useCart();

  useEffect(() => {
    if (!storeSlug || !productId) {
      setLoading(false);
      setError('Parâmetros inválidos.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getStoreBySlug(storeSlug),
      getStoreProduct(storeSlug, productId),
    ])
      .then(([s, p]) => {
        if (!cancelled) {
          setStore(s);
          setProduct(p);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err as Error).message ?? 'Erro ao carregar produto.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeSlug, productId]);

  const unitPrice = product
    ? Number(product.promotionalPrice ?? product.price)
    : 0;
  const optionsTotal = selectedOptions.reduce((s, o) => s + o.price, 0);
  const totalPrice = (unitPrice + optionsTotal) * quantity;

  const toggleOption = (group: ProductOptionGroup, item: ProductOptionItem) => {
    const isSelected = selectedOptions.some(
      (o) => o.groupId === group.id && o.itemId === item.id
    );
    if (isSelected) {
      setSelectedOptions((prev) =>
        prev.filter((o) => !(o.groupId === group.id && o.itemId === item.id))
      );
    } else {
      const currentInGroup = selectedOptions.filter((o) => o.groupId === group.id);
      if (currentInGroup.length >= group.maxSelect) return;
      setSelectedOptions((prev) => [
        ...prev.filter((o) => o.groupId !== group.id),
        {
          groupId: group.id,
          groupName: group.name,
          itemId: item.id,
          itemName: item.name,
          price: Number(item.price),
        },
      ]);
    }
  };

  const canSubmit = useMemo(() => {
    if (!product?.optionGroups) return true;
    for (const g of product.optionGroups) {
      if (!g.isRequired) continue;
      const count = selectedOptions.filter((o) => o.groupId === g.id).length;
      if (count < g.minSelect) return false;
    }
    return true;
  }, [product, selectedOptions]);

  const handleAddToCart = () => {
    if (!product || !store) return;
    setStoreCart(storeSlug, store.id);
    addItem({
      product,
      quantity,
      notes: notes.trim() || undefined,
      selectedOptions,
    });
    router.push(`/menu?store=${encodeURIComponent(storeSlug)}`);
  };

  if (!storeSlug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <EmptyState
          title="Loja não configurada"
          description="Use ?store=slug na URL ou defina NEXT_PUBLIC_STORE_SLUG."
        />
      </div>
    );
  }

  if (loading) return <LoadingPage />;
  if (error || !store || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white p-4">
        <EmptyState
          title="Produto não encontrado"
          description={error ?? 'Verifique o link e tente novamente.'}
        />
        <Link
          href={`/menu?store=${encodeURIComponent(storeSlug)}`}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  const unavailable = product.isAvailable === false;
  const optionGroups = product.optionGroups ?? [];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/98 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href={`/menu?store=${encodeURIComponent(storeSlug)}`}
            className="rounded-xl px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            ← Cardápio
          </Link>
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.name}
              width={32}
              height={32}
              className="rounded-lg object-cover ring-1 ring-gray-100"
            />
          ) : (
            <span className="font-semibold text-gray-900">{store.name}</span>
          )}
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
          {product.imageUrl && (
            <div className="relative aspect-[4/3] w-full bg-gray-100">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 672px) 100vw, 672px"
                priority
              />
              {unavailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm font-medium text-white">
                    Indisponível
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="p-5">
            <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
            {product.description && (
              <p className="mt-2 text-sm text-gray-600">{product.description}</p>
            )}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xl font-semibold text-primary">
                {formatCurrency(unitPrice)}
              </span>
              {product.promotionalPrice != null && (
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(Number(product.price))}
                </span>
              )}
            </div>

            {optionGroups.length > 0 && (
              <div className="mt-6 space-y-4">
                {optionGroups.map((group) => (
                  <div key={group.id}>
                    <p className="mb-2 font-medium text-gray-900">
                      {group.name}
                      {group.isRequired && (
                        <span className="text-red-500"> *</span>
                      )}
                      {(group.minSelect > 0 || group.maxSelect < 999) && (
                        <span className="ml-1 text-sm font-normal text-gray-500">
                          (mín. {group.minSelect}, máx. {group.maxSelect})
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.items
                        .filter((i) => i.isActive)
                        .map((item) => {
                          const selected = selectedOptions.some(
                            (o) => o.groupId === group.id && o.itemId === item.id
                          );
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleOption(group, item)}
                              disabled={unavailable}
                              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                                selected
                                  ? 'border-gray-900 bg-gray-900 text-white'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                              } ${unavailable ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              {item.name}
                              {Number(item.price) > 0 && (
                                <span className={selected ? 'text-white/90' : 'text-primary'}>
                                  {' '}+{formatCurrency(Number(item.price))}
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Observações
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: sem cebola"
                disabled={unavailable}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200 disabled:bg-gray-50"
              />
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center rounded-xl border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={unavailable}
                  className="rounded-l-xl px-3 py-2.5 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={unavailable}
                  className="rounded-r-xl px-3 py-2.5 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(totalPrice)}
                </span>
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!canSubmit || unavailable}
                  className="rounded-xl bg-gray-900 hover:bg-gray-800"
                >
                  {unavailable ? 'Indisponível' : 'Adicionar ao carrinho'}
                </Button>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ProductPageContent />
    </Suspense>
  );
}
