'use client';

import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 px-6 text-center shadow-card',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-gray-300">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
