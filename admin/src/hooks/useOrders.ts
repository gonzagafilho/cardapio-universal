'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrders } from '@/services/order.service';
import type { Order } from '@/types/order';

export function useOrders(establishmentId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOrders(establishmentId);
      setOrders(result ?? []);
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, [establishmentId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
