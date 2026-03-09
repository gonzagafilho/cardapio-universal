'use client';

import { cn } from '@/lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export function DataTable<T extends object>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Nenhum registro encontrado.',
  className,
}: {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-gray-200 bg-white', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
