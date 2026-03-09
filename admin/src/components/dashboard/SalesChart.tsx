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
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';

interface DataPoint {
  date: string;
  total: number;
  count: number;
}

export function SalesChart({ data }: { data: DataPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Vendas por período</h3>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v).replace(/\s/g, '')} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Total']} labelFormatter={(l) => `Data: ${l}`} />
              <Line type="monotone" dataKey="total" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
