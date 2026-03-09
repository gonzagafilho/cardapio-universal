'use client';

import { useState, useCallback } from 'react';
import { createOrder } from '@/services/order.service';
import type { Order } from '@/types/order';
import type { CreateOrderDto } from '@/services/order.service';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const submitOrder = useCallback(async (dto: CreateOrderDto) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const result = await createOrder(dto);
      setOrder(result);
      return result;
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Erro ao criar pedido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setOrder(null);
  }, []);

  return {
    submitOrder,
    loading,
    error,
    order,
    reset,
  };
}
