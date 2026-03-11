'use client';

import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Exibe badge numérico ao lado do título (ex: quantidade no carrinho). */
  badge?: number;
  side?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  badge,
  side = 'right',
  children,
  className,
}: DrawerProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const sideClasses =
    side === 'right'
      ? 'right-0 translate-x-0'
      : 'left-0 -translate-x-0';

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        aria-hidden
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal
        className={cn(
          'absolute top-0 bottom-0 w-full max-w-sm flex flex-col bg-white shadow-xl transition-transform',
          sideClasses,
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {title}
              {badge != null && badge > 0 && (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gray-900 px-2 text-xs font-bold text-white">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>
      </aside>
    </div>
  );
}
