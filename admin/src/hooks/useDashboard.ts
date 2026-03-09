'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDashboard } from '@/services/dashboard.service';
import type { DashboardData } from '@/types/dashboard';

export function useDashboard(establishmentId?: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboard(establishmentId);
      setData(result);
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, [establishmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
