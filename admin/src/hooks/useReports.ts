'use client';

import { useState, useCallback } from 'react';
import {
  getSalesSummary,
  getOrdersByDay,
  getTopProducts,
  getPaymentMethodsReport,
  getCancelledOrders,
} from '@/services/report.service';

export function useReports(establishmentId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesSummary = useCallback(
    async (start: string, end: string) => {
      setLoading(true);
      setError(null);
      try {
        return await getSalesSummary(establishmentId, start, end);
      } catch (err) {
        setError((err as Error).message ?? 'Erro');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [establishmentId]
  );

  const fetchOrdersByDay = useCallback(
    async (start: string, end: string) => {
      return getOrdersByDay(establishmentId, start, end);
    },
    [establishmentId]
  );

  const fetchTopProducts = useCallback(
    async (start: string, end: string, limit?: number) => {
      return getTopProducts(establishmentId, start, end, limit);
    },
    [establishmentId]
  );

  const fetchPaymentMethods = useCallback(
    async (start: string, end: string) => {
      return getPaymentMethodsReport(establishmentId, start, end);
    },
    [establishmentId]
  );

  const fetchCancelledOrders = useCallback(
    async (start: string, end: string) => {
      return getCancelledOrders(establishmentId, start, end);
    },
    [establishmentId]
  );

  return {
    loading,
    error,
    fetchSalesSummary,
    fetchOrdersByDay,
    fetchTopProducts,
    fetchPaymentMethods,
    fetchCancelledOrders,
  };
}
