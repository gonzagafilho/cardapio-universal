import { apiGet } from './api';
import type { Store, StoreSettings } from '@/types/store';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';

const PUBLIC_PREFIX = '/public/store';

export async function getStoreBySlug(slug: string): Promise<Store> {
  return apiGet<Store>(`${PUBLIC_PREFIX}/${slug}`);
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
