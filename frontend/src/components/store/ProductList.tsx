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
      <p className="py-8 text-center text-gray-500">{emptyMessage}</p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
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
