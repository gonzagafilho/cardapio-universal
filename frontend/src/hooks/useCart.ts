'use client';

import { useCartStore } from '@/stores/cart.store';

export function useCart() {
  const items = useCartStore((s) => s.items);
  const storeSlug = useCartStore((s) => s.storeSlug);
  const establishmentId = useCartStore((s) => s.establishmentId);
  const discount = useCartStore((s) => s.discount);
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const couponCode = useCartStore((s) => s.couponCode);

  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const setDiscount = useCartStore((s) => s.setDiscount);
  const setDeliveryFee = useCartStore((s) => s.setDeliveryFee);
  const setCouponCode = useCartStore((s) => s.setCouponCode);
  const clearCart = useCartStore((s) => s.clearCart);
  const setStore = useCartStore((s) => s.setStore);

  const subtotal = useCartStore((s) => s.getSubtotal());
  const total = useCartStore((s) => s.getTotal());
  const itemCount = useCartStore((s) => s.getItemCount());

  return {
    items,
    storeSlug,
    establishmentId,
    discount,
    deliveryFee,
    couponCode,
    subtotal,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    setDeliveryFee,
    setCouponCode,
    clearCart,
    setStore,
  };
}
