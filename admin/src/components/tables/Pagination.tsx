'use client';

import { cn } from '@/lib/cn';

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-center gap-2 py-4', className)}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-sm text-gray-600">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  );
}
