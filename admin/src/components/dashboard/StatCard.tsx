'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';

export function StatCard({
  title,
  value,
  format = 'number',
  subtitle,
}: {
  title: string;
  value: number | string;
  format?: 'number' | 'currency';
  subtitle?: string;
}) {
  const display = format === 'currency' && typeof value === 'number' ? formatCurrency(value) : value;
  return (
    <Card>
      <CardContent>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{display}</p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
