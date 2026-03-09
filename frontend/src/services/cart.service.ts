import { apiPost, apiPatch, apiGet, apiDelete } from './api';
import type { Cart, CartItem } from '@/types/cart';
import type { AddCartItemDto } from '@/types/cart';

const CARTS_PATH = '/carts';

export async function createCart(
  establishmentId: string,
  sessionId?: string,
  customerId?: string
): Promise<Cart & { id: string }> {
  return apiPost<Cart & { id: string }>(CARTS_PATH, {
    establishmentId,
    sessionId,
    customerId,
  });
}

export async function getCart(cartId: string): Promise<Cart> {
  return apiGet<Cart>(`${CARTS_PATH}/${cartId}`);
}

export async function addCartItem(
  cartId: string,
  dto: AddCartItemDto
): Promise<Cart> {
  return apiPost<Cart>(`${CARTS_PATH}/${cartId}/items`, dto);
}

export async function updateCartItem(
  cartId: string,
  itemId: string,
  dto: { quantity?: number; notes?: string }
): Promise<Cart> {
  return apiPatch<Cart>(`${CARTS_PATH}/${cartId}/items/${itemId}`, dto);
}

export async function removeCartItem(
  cartId: string,
  itemId: string
): Promise<Cart> {
  return apiDelete<Cart>(`${CARTS_PATH}/${cartId}/items/${itemId}`);
}

export async function applyCoupon(cartId: string, code: string): Promise<Cart> {
  return apiPost<Cart>(`${CARTS_PATH}/${cartId}/apply-coupon`, { code });
}

export async function removeCoupon(cartId: string): Promise<Cart> {
  return apiPost<Cart>(`${CARTS_PATH}/${cartId}/remove-coupon`);
}

export async function calculateCart(cartId: string): Promise<Cart> {
  return apiPost<Cart>(`${CARTS_PATH}/${cartId}/calculate`);
}
