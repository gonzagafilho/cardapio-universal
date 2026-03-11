'use client';

import { ProductCard } from './ProductCard';
import type { Product } from '@/types/product';

export interface ProductListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  emptyMessage?: string;
}

export function ProductList({
  products,
  onProductClick,
  emptyMessage = 'Nenhum produto nesta categoria.',
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center shadow-card">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            onClick={() => onProductClick(product)}
          />
        </li>
      ))}
    </ul>
  );
}
