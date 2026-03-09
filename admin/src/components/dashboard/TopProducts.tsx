'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';

interface Item {
  productId: string;
  name: string;
  quantity: number;
  total: number;
}

export function TopProducts({ data }: { data: Item[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Top produtos</h3>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.slice(0, 5).map((item, i) => (
            <li key={item.productId} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {i + 1}. {item.name}
              </span>
              <span className="font-medium">{item.quantity} un · {formatCurrency(item.total)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
