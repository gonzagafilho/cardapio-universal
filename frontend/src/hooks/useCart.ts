'use client';

import { useCartContext } from '@/contexts';

export function useCart() {
  return useCartContext();
}
