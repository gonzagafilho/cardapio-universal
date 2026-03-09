'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/cn';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function Drawer({ open, onClose, title, side = 'right', children, className }: DrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sideClass = side === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={onClose} />
      <aside
        role="dialog"
        className={cn(
          'absolute top-0 bottom-0 w-full max-w-sm bg-white shadow-xl',
          sideClass,
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100" aria-label="Fechar">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto h-full">{children}</div>
      </aside>
    </div>
  );
}
