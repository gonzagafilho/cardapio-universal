'use client';

import { formatCurrency } from '@/lib/currency';

interface Item {
  productId: string;
  name: string;
  quantity: number;
  total: number;
}

export function TopProducts({ data }: { data: Item[] }) {
  const items = data.slice(0, 5);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Performance
          </p>

          <h3 className="mt-1 text-lg font-semibold text-gray-900">
            Produtos mais vendidos
          </h3>
        </div>

        <span className="text-xs text-gray-500">
          Top 5
        </span>
      </div>

      {/* list */}
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li
            key={item.productId}
            className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">

              {/* rank */}
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
                {i + 1}
              </span>

              {/* name */}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.name}
                </p>

                <p className="text-xs text-gray-500">
                  {item.quantity} vendidos
                </p>
              </div>

            </div>

            {/* value */}
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(item.total)}
            </span>

          </li>
        ))}
      </ul>
    </div>
  );
}