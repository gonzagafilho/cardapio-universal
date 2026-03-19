import { apiGet, apiPost } from './api';
import type { Store, StoreSettings } from '@/types/store';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';
import type { Order } from '@/types/order';

const PUBLIC_PREFIX = '/public/store';
const SESSION_STORAGE_KEY = 'cardapio-public-session-id';
const TABLE_CONTEXT_KEY_PREFIX = 'cardapio-public-table-context:';

/** SessionId estável para carrinho/pedido público (sem login). */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

export interface PublicCart {
  id: string;
  items: Array<{ id: string; productId: string; quantity: number; unitPrice: number; totalPrice: number; notes?: string | null; product?: unknown }>;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

/** Busca carrinho público por slug e sessionId. */
export async function getPublicCart(slug: string, sessionId: string): Promise<PublicCart> {
  return apiGet<PublicCart>(`${PUBLIC_PREFIX}/${slug}/cart/${encodeURIComponent(sessionId)}`);
}

/** Adiciona/atualiza item no carrinho público. */
export async function addPublicCartItem(
  slug: string,
  dto: { sessionId: string; productId: string; quantity: number; notes?: string }
): Promise<PublicCart> {
  return apiPost<PublicCart>(`${PUBLIC_PREFIX}/${slug}/cart/item`, dto);
}

/** Sincroniza itens do carrinho local com o carrinho público (agrupa por productId). */
export async function syncPublicCart(slug: string, sessionId: string, items: CartItem[]): Promise<void> {
  const byProduct = new Map<string, { quantity: number; notes?: string }>();
  for (const item of items) {
    const cur = byProduct.get(item.productId) ?? { quantity: 0, notes: item.notes ?? undefined };
    cur.quantity += item.quantity;
    byProduct.set(item.productId, cur);
  }
  for (const [productId, payload] of Array.from(byProduct.entries())) {
    await addPublicCartItem(slug, {
      sessionId,
      productId,
      quantity: payload.quantity,
      notes: payload.notes,
    });
  }
}

export interface CreatePublicOrderDto {
  sessionId: string;
  cartId: string;
  type: 'delivery' | 'pickup' | 'dine_in';
  paymentMethod?: string;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  tableId?: string;
  tableToken?: string;
}

export interface CreatePublicOrderResult {
  order: Order;
  payment?: unknown;
  paymentError?: string;
}

/** Cria pedido público a partir do carrinho (endpoint público, sem auth). */
export async function createPublicOrder(slug: string, dto: CreatePublicOrderDto): Promise<CreatePublicOrderResult> {
  return apiPost<CreatePublicOrderResult>(`${PUBLIC_PREFIX}/${slug}/order`, dto);
}

export async function getStoreBySlug(slug: string): Promise<Store> {
  return apiGet<Store>(`${PUBLIC_PREFIX}/${slug}`);
}

/** Resolve loja pelo domínio personalizado (host). Retorna null se não houver. */
export async function getStoreByHost(host: string): Promise<Store | null> {
  if (!host?.trim()) return null;
  try {
    const store = await apiGet<Store>(`${PUBLIC_PREFIX}/by-host?host=${encodeURIComponent(host)}`);
    return store ?? null;
  } catch {
    return null;
  }
}

export async function getStoreCategories(slug: string): Promise<Category[]> {
  return apiGet<Category[]>(`${PUBLIC_PREFIX}/${slug}/categories`);
}

export async function getStoreProducts(
  slug: string,
  categoryId?: string
): Promise<Product[]> {
  const qs = categoryId ? `?categoryId=${categoryId}` : '';
  return apiGet<Product[]>(`${PUBLIC_PREFIX}/${slug}/products${qs}`);
}

export async function getStoreProduct(
  slug: string,
  productId: string
): Promise<Product> {
  return apiGet<Product>(`${PUBLIC_PREFIX}/${slug}/products/${productId}`);
}

export async function getStoreSettings(slug: string): Promise<StoreSettings> {
  return apiGet<StoreSettings>(`${PUBLIC_PREFIX}/${slug}/settings`);
}

export interface PublicTable {
  id: string;
  name: string;
  number?: string | null;
}

export async function getPublicTableByToken(slug: string, token: string): Promise<PublicTable> {
  return apiGet<PublicTable>(`${PUBLIC_PREFIX}/${slug}/table?token=${encodeURIComponent(token)}`);
}

export type PublicTableContext = {
  slug: string;
  token: string;
  tableId: string;
  tableName: string;
  tableNumber?: string | null;
  resolvedAt: number;
};

export function getPublicTableContext(slug: string): PublicTableContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${TABLE_CONTEXT_KEY_PREFIX}${slug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PublicTableContext;
    if (!parsed?.tableId || parsed.slug !== slug) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setPublicTableContext(ctx: PublicTableContext): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${TABLE_CONTEXT_KEY_PREFIX}${ctx.slug}`, JSON.stringify(ctx));
  } catch {
    // ignore
  }
}

export function clearPublicTableContext(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${TABLE_CONTEXT_KEY_PREFIX}${slug}`);
  } catch {
    // ignore
  }
}

