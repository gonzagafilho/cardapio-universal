import type { Product } from './product';

export interface SelectedOption {
  groupId: string;
  groupName: string;
  itemId: string;
  itemName: string;
  price: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  notes?: string;
  selectedOptions: SelectedOption[];
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string | null;
}

export interface AddCartItemDto {
  productId: string;
  quantity: number;
  notes?: string;
  options?: { groupId: string; itemId: string }[];
}
