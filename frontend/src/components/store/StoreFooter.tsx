'use client';

import type { Store } from '@/types/store';

export interface StoreFooterProps {
  store: Store;
}

export function StoreFooter({ store }: StoreFooterProps) {
  const whatsappLink = store.whatsapp
    ? `https://wa.me/${store.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-6">
      <div className="mx-auto max-w-4xl px-4">
        <p className="text-center text-sm text-gray-600">
          {store.name}
          {store.address && (
            <>
              {' · '}
              {store.address}
              {store.city && `, ${store.city}`}
            </>
          )}
        </p>
        {(store.phone || whatsappLink) && (
          <p className="mt-1 text-center text-sm text-gray-600">
            {store.phone && <span>Tel: {store.phone}</span>}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline"
              >
                WhatsApp
              </a>
            )}
          </p>
        )}
      </div>
    </footer>
  );
}
