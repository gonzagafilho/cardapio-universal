'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '@/services/product.service';
import type { Product } from '@/types/product';

export function useProducts(establishmentId?: string, categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProducts(establishmentId, categoryId);
      setProducts(result ?? []);
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [establishmentId, categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}
