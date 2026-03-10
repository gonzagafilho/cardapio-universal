'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getStoreBySlug,
  getStoreByHost,
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

/** Carrega loja pelo domínio personalizado (host). Usar quando linkBase = ''. */
export function useStoreDataByHost(host: string | null) {
  const [state, setState] = useState<StoreDataState>({
    store: null,
    settings: null,
    categories: [],
    products: [],
    loading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    if (!host?.trim()) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const store = await getStoreByHost(host);
      if (!store) {
        setState((s) => ({ ...s, loading: false, error: 'Loja não encontrada' }));
        return;
      }
      const [categories, products, settings] = await Promise.all([
        getStoreCategories(store.slug),
        getStoreProducts(store.slug),
        getStoreSettings(store.slug),
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
  }, [host]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}
