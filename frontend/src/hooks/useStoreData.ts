'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getStoreBySlug,
  getStoreCategories,
  getStoreProducts,
  getStoreSettings,
} from '@/services/store.service';
import type { Store, StoreSettings } from '@/types/store';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';

interface StoreDataState {
  store: Store | null;
  settings: StoreSettings | null;
  categories: Category[];
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useStoreData(storeSlug: string | null) {
  const [state, setState] = useState<StoreDataState>({
    store: null,
    settings: null,
    categories: [],
    products: [],
    loading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    if (!storeSlug) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [store, categories, products, settings] = await Promise.all([
        getStoreBySlug(storeSlug),
        getStoreCategories(storeSlug),
        getStoreProducts(storeSlug),
        getStoreSettings(storeSlug),
      ]);
      setState({
        store,
        categories: categories ?? [],
        products: products ?? [],
        settings: settings ?? null,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: (err as Error).message ?? 'Erro ao carregar loja',
      }));
    }
  }, [storeSlug]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refetch = fetchAll;

  return {
    ...state,
    refetch,
  };
}
