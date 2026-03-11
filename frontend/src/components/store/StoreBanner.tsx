'use client';

import Image from 'next/image';
import type { Store } from '@/types/store';

export interface StoreBannerProps {
  store: Store;
}

export function StoreBanner({ store }: StoreBannerProps) {
  if (!store.bannerUrl) return null;

  return (
    <div className="relative h-40 w-full overflow-hidden bg-gray-100 md:h-52">
      <Image
        src={store.bannerUrl}
        alt={`Banner ${store.name}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 896px"
        priority
      />
    </div>
  );
}
