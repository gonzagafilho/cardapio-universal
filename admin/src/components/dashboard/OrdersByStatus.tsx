'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { getOrderStatusLabel } from '@/lib/format';

interface DataPoint {
  status: string;
  count: number;
}

export function OrdersByStatus({ data }: { data: DataPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: getOrderStatusLabel(d.status),
  }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Operação
          </p>

          <h3 className="mt-1 text-lg font-semibold text-gray-900">
            Pedidos por status
          </h3>
        </div>

        <span className="text-xs text-gray-500">
          Distribuição atual
        </span>
      </div>

      {/* chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 80 }}
          >

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#f1f5f9"
            />

            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              type="category"
              dataKey="label"
              width={90}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              }}
            />

            <Bar
              dataKey="count"
              fill="#111827"
              radius={[0, 6, 6, 0]}
            />

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}