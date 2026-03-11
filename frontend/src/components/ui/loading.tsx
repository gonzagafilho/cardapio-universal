'use client';

import { cn } from '@/lib/cn';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ size = 'md', className }: LoadingProps) {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-14 w-14 border-[3px]',
  };
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-gray-200 border-t-primary',
        sizes[size],
        className
      )}
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-white px-4">
      <Loading size="lg" />
      <p className="text-sm font-medium text-gray-500">Carregando...</p>
    </div>
  );
}
