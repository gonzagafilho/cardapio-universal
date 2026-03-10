'use client';

import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';
import type { Product } from '@/types/product';

export interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const price = Number(product.promotionalPrice ?? product.price);
  const hasPromo = product.promotionalPrice != null && Number(product.promotionalPrice) < Number(product.price);
  const unavailable = product.isAvailable === false;

  return (
    <button
      type="button"
      onClick={unavailable ? undefined : onClick}
      disabled={unavailable}
      className={`flex w-full gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition ${
        unavailable ? 'cursor-not-allowed opacity-75' : 'hover:border-primary/30 hover:shadow-md'
      }`}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
            {product.name.charAt(0)}
          </div>
        )}
        {unavailable && (
          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-sm font-medium text-white">
            Esgotado
          </span>
        )}
        {!unavailable && product.isFeatured && (
          <span className="absolute left-1 top-1 rounded bg-amber-500 px-1.5 py-0.5 text-xs font-medium text-white">
            Destaque
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
            {product.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-primary">
            {formatCurrency(price)}
          </span>
          {hasPromo && (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(Number(product.price))}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
