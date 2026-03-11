'use client';

import { formatCurrency } from '@/lib/currency';
import { ArrowUpRight } from 'lucide-react';

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
  const display =
    format === 'currency' && typeof value === 'number'
      ? formatCurrency(value)
      : value;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      {/* glow subtle */}
      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-gradient-to-br from-gray-50 to-white" />

      <div className="relative">

        {/* header */}
        <div className="flex items-start justify-between">

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              Indicador
            </p>

            <p className="mt-2 text-sm font-medium text-gray-500">
              {title}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            <ArrowUpRight size={16} className="text-gray-700" />
          </div>
        </div>

        {/* value */}
        <p className="mt-6 text-3xl font-semibold tracking-tight text-gray-900">
          {display}
        </p>

        {/* footer */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">

          <span>
            {subtitle ?? 'Atualizado em tempo real'}
          </span>

          <span className="font-medium text-gray-700">
            Hoje
          </span>

        </div>

      </div>
    </div>
  );
}