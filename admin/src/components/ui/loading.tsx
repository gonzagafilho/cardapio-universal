'use client';

import { cn } from '@/lib/cn';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ size = 'md', className }: LoadingProps) {
  const sizes = { sm: 'h-6 w-6 border-2', md: 'h-10 w-10 border-2', lg: 'h-14 w-14 border-3' };
  return (
    <div
      className={cn('animate-spin rounded-full border-primary border-t-transparent', sizes[size], className)}
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-10 shadow-sm">
        <Loading size="lg" />
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">Carregando…</p>
          <p className="mt-1 text-xs text-gray-500">Só um instante.</p>
        </div>
      </div>
    </div>
  );
}
