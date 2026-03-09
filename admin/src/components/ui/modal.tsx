'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/cn';

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      document.addEventListener('keydown', fn);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn('relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100" aria-label="Fechar">
              <span className="text-gray-500">×</span>
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
