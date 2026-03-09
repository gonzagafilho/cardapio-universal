'use client';

import { cn } from '@/lib/cn';

export function FiltersBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3',
        className
      )}
    >
      {children}
    </div>
  );
}
