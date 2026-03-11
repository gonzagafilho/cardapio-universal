'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, SelectedOption } from '@/types/cart';
import type { Product } from '@/types/product';

const CART_STORAGE_KEY = 'cardapio-cart';

export interface CartItemInput {
  product: Product;
  quantity: number;
  notes?: string;
  selectedOptions: SelectedOption[];
}

interface CartState {
  storeSlug: string | null;
  establishmentId: string | null;
  items: CartItem[];
  discount: number;
  deliveryFee: number;
  couponCode: string | null;
}

interface CartContextValue extends CartState {
  addItem: (input: CartItemInput) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  setStore: (slug: string, establishmentId: string) => void;
  setDiscount: (value: number) => void;
  setDeliveryFee: (value: number) => void;
  setCouponCode: (code: string | null) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

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

function isValidCartItem(raw: unknown): raw is CartItem {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.productId !== 'string') return false;
  if (typeof o.quantity !== 'number' || o.quantity < 1) return false;
  if (typeof o.unitPrice !== 'number' || o.unitPrice < 0) return false;
  if (typeof o.totalPrice !== 'number' || o.totalPrice < 0) return false;
  if (!Array.isArray(o.selectedOptions)) return false;
  const product = o.product as Record<string, unknown> | undefined;
  if (!product || typeof product.id !== 'string' || typeof product.name !== 'string') return false;
  if (typeof (product as { price?: unknown }).price !== 'number' && typeof (product as { price?: unknown }).price !== 'string') return false;
  return true;
}

function loadFromStorage(): Partial<CartState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Partial<CartState>;
    if (!data.items || !Array.isArray(data.items)) return {};
    const items = data.items.filter(isValidCartItem);
    return {
      storeSlug: typeof data.storeSlug === 'string' ? data.storeSlug : null,
      establishmentId: typeof data.establishmentId === 'string' ? data.establishmentId : null,
      items,
      discount: typeof data.discount === 'number' && data.discount >= 0 ? data.discount : 0,
      deliveryFee: typeof data.deliveryFee === 'number' && data.deliveryFee >= 0 ? data.deliveryFee : 0,
      couponCode: data.couponCode != null ? String(data.couponCode) : null,
    };
  } catch {
    // ignore parse errors
  }
  return {};
}

function saveToStorage(state: CartState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / privacy errors
  }
}

const initialState: CartState = {
  storeSlug: null,
  establishmentId: null,
  items: [],
  discount: 0,
  deliveryFee: 0,
  couponCode: null,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadFromStorage();
    setState((prev) => ({
      ...prev,
      ...saved,
      items: saved.items?.length ? saved.items : prev.items,
    }));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(state);
  }, [hydrated, state]);

  const addItem = useCallback((input: CartItemInput) => {
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

    setState((prev) => {
      const existing = prev.items.find(
        (i) =>
          i.productId === product.id &&
          i.notes === (notes ?? '') &&
          JSON.stringify(
            i.selectedOptions.map((o) => ({ g: o.groupId, i: o.itemId })).sort()
          ) ===
            JSON.stringify(
              selectedOptions.map((o) => ({ g: o.groupId, i: o.itemId })).sort()
            )
      );
      if (existing) {
        const optTotal = existing.selectedOptions.reduce((s, o) => s + o.price, 0);
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.id === existing.id
              ? {
                  ...i,
                  quantity: i.quantity + quantity,
                  totalPrice: calculateItemTotal(
                    i.unitPrice,
                    i.quantity + quantity,
                    optTotal
                  ),
                }
              : i
          ),
        };
      }
      return { ...prev, items: [...prev.items, newItem] };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      }));
      return;
    }
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => {
        if (i.id !== itemId) return i;
        const optTotal = i.selectedOptions.reduce((s, o) => s + o.price, 0);
        return {
          ...i,
          quantity,
          totalPrice: calculateItemTotal(i.unitPrice, quantity, optTotal),
        };
      }),
    }));
  }, []);

  const updateItemNotes = useCallback((itemId: string, notes: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, notes } : i)),
    }));
  }, []);

  const setStore = useCallback((slug: string, establishmentId: string) => {
    setState((prev) => ({ ...prev, storeSlug: slug, establishmentId }));
  }, []);

  const setDiscount = useCallback((value: number) => {
    setState((prev) => ({ ...prev, discount: value }));
  }, []);

  const setDeliveryFee = useCallback((value: number) => {
    setState((prev) => ({ ...prev, deliveryFee: value }));
  }, []);

  const setCouponCode = useCallback((code: string | null) => {
    setState((prev) => ({ ...prev, couponCode: code }));
  }, []);

  const clearCart = useCallback(() => {
    setState((prev) => ({
      ...prev,
      items: [],
      discount: 0,
      deliveryFee: 0,
      couponCode: null,
    }));
  }, []);

  const subtotal = useMemo(
    () => state.items.reduce((s, i) => s + i.totalPrice, 0),
    [state.items]
  );

  const total = useMemo(
    () => Math.max(0, subtotal - state.discount + state.deliveryFee),
    [subtotal, state.discount, state.deliveryFee]
  );

  const itemCount = useMemo(
    () => state.items.reduce((s, i) => s + i.quantity, 0),
    [state.items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      updateItemNotes,
      setStore,
      setDiscount,
      setDeliveryFee,
      setCouponCode,
      clearCart,
      subtotal,
      total,
      itemCount,
    }),
    [
      state,
      addItem,
      removeItem,
      updateQuantity,
      updateItemNotes,
      setStore,
      setDiscount,
      setDeliveryFee,
      setCouponCode,
      clearCart,
      subtotal,
      total,
      itemCount,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return ctx;
}
