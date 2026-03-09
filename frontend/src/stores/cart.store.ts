import { create } from 'zustand';
import type { CartItem, SelectedOption } from '@/types/cart';
import type { Product } from '@/types/product';

export interface CartItemInput {
  product: Product;
  quantity: number;
  notes?: string;
  selectedOptions: SelectedOption[];
}

function generateCartItemId(): string {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function calculateItemTotal(
  unitPrice: number,
  quantity: number,
  optionsTotal: number
): number {
  return (unitPrice + optionsTotal) * quantity;
}

interface CartState {
  storeSlug: string | null;
  establishmentId: string | null;
  items: CartItem[];
  discount: number;
  deliveryFee: number;
  couponCode: string | null;

  setStore: (slug: string, establishmentId: string) => void;
  addItem: (input: CartItemInput) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  setDiscount: (value: number) => void;
  setDeliveryFee: (value: number) => void;
  setCouponCode: (code: string | null) => void;
  clearCart: () => void;
  hydrate: (items: CartItem[]) => void;

  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  storeSlug: null,
  establishmentId: null,
  items: [],
  discount: 0,
  deliveryFee: 0,
  couponCode: null,

  setStore(slug, establishmentId) {
    set({ storeSlug: slug, establishmentId });
  },

  addItem(input) {
    const { product, quantity, notes, selectedOptions } = input;
    const unitPrice = Number(product.promotionalPrice ?? product.price);
    const optionsTotal = selectedOptions.reduce((s, o) => s + o.price, 0);
    const totalPrice = calculateItemTotal(unitPrice, quantity, optionsTotal);

    const newItem: CartItem = {
      id: generateCartItemId(),
      productId: product.id,
      product,
      quantity,
      unitPrice,
      notes,
      selectedOptions,
      totalPrice,
    };

    const existing = get().items.find(
      (i) =>
        i.productId === product.id &&
        i.notes === (notes ?? '') &&
        JSON.stringify(i.selectedOptions.map((o) => ({ g: o.groupId, i: o.itemId })).sort()) ===
          JSON.stringify(
            selectedOptions.map((o) => ({ g: o.groupId, i: o.itemId })).sort()
          )
    );

    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantity: i.quantity + quantity,
                totalPrice: calculateItemTotal(
                  i.unitPrice,
                  i.quantity + quantity,
                  i.selectedOptions.reduce((s, o) => s + o.price, 0)
                ),
              }
            : i
        ),
      }));
    } else {
      set((state) => ({ items: [...state.items, newItem] }));
    }
  },

  removeItem(itemId) {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }));
  },

  updateQuantity(itemId, quantity) {
    if (quantity < 1) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) => {
        if (i.id !== itemId) return i;
        const optTotal = i.selectedOptions.reduce((s, o) => s + o.price, 0);
        return {
          ...i,
          quantity,
          totalPrice: calculateItemTotal(i.unitPrice, quantity, optTotal),
        };
      }),
    }));
  },

  updateItemNotes(itemId, notes) {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, notes } : i
      ),
    }));
  },

  setDiscount(value) {
    set({ discount: value });
  },

  setDeliveryFee(value) {
    set({ deliveryFee: value });
  },

  setCouponCode(code) {
    set({ couponCode: code });
  },

  clearCart() {
    set({
      items: [],
      discount: 0,
      deliveryFee: 0,
      couponCode: null,
    });
  },

  hydrate(items) {
    set({ items });
  },

  getSubtotal() {
    return get().items.reduce((s, i) => s + i.totalPrice, 0);
  },

  getTotal() {
    const { items, discount, deliveryFee } = get();
    const sub = items.reduce((s, i) => s + i.totalPrice, 0);
    return Math.max(0, sub - discount + deliveryFee);
  },

  getItemCount() {
    return get().items.reduce((s, i) => s + i.quantity, 0);
  },
}));

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.totalPrice, 0);
}

export function getCartTotal(
  items: CartItem[],
  discount: number,
  deliveryFee: number
): number {
  return Math.max(0, getCartSubtotal(items) - discount + deliveryFee);
}
