'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { formatCurrency } from '@/lib/currency';

interface DataPoint {
  date: string;
  total: number;
  count: number;
}

export function SalesChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Analytics
          </p>

          <h3 className="mt-1 text-lg font-semibold text-gray-900">
            Vendas por período
          </h3>
        </div>

        <span className="text-xs text-gray-500">
          Últimos dias
        </span>
      </div>

      {/* chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                formatCurrency(v).replace(/\s/g, '')
              }
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.08)',
              }}
              formatter={(v: number) => [
                formatCurrency(v),
                'Total',
              ]}
              labelFormatter={(l) => `Data: ${l}`}
            />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#111827"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
              }}
            />

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}