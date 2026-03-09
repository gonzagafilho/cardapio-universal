'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { getOrderStatusLabel } from '@/lib/format';

interface DataPoint {
  status: string;
  count: number;
}

export function OrdersByStatus({ data }: { data: DataPoint[] }) {
  const chartData = data.map((d) => ({ ...d, label: getOrderStatusLabel(d.status) }));

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Pedidos por status</h3>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="label" width={80} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0f766e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
