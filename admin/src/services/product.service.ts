import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Product } from '@/types/product';

export async function getProducts(establishmentId?: string, categoryId?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (establishmentId) params.set('establishmentId', establishmentId);
  if (categoryId) params.set('categoryId', categoryId);
  const qs = params.toString() ? `?${params}` : '';
  return apiGet<Product[]>(`/products${qs}`);
}

export async function getProduct(id: string): Promise<Product> {
  return apiGet<Product>(`/products/${id}`);
}

export async function createProduct(dto: import('@/types/product').CreateProductDto, establishmentId: string): Promise<Product> {
  return apiPost<Product>(`/products?establishmentId=${establishmentId}`, dto);
}

export async function updateProduct(id: string, dto: import('@/types/product').UpdateProductDto): Promise<Product> {
  return apiPatch<Product>(`/products/${id}`, dto);
}

export async function deleteProduct(id: string): Promise<void> {
  return apiDelete(`/products/${id}`);
}

export async function updateProductStatus(id: string, isActive: boolean): Promise<Product> {
  return apiPatch<Product>(`/products/${id}/status`, { isActive });
}
