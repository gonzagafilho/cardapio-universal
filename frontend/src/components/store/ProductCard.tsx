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
      className={`flex w-full gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-card transition-all duration-200 ${
        unavailable
          ? 'cursor-not-allowed opacity-70'
          : 'hover:border-gray-200 hover:shadow-card-hover active:scale-[0.99]'
      }`}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-300">
            {product.name.charAt(0)}
          </div>
        )}
        {unavailable && (
          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-sm font-medium text-white">
            Esgotado
          </span>
        )}
        {!unavailable && product.isFeatured && (
          <span className="absolute left-2 top-2 rounded-lg bg-primary/90 px-2 py-0.5 text-xs font-medium text-white shadow">
            Destaque
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {product.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
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
