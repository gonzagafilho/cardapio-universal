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
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loading size="lg" />
    </div>
  );
}
