'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrder } from '@/services/order.service';
import type { Order } from '@/types/order';

export function useOrderTracking(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError((err as Error).message ?? 'Pedido não encontrado');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
}
