import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Category } from '@/types/category';

export async function getCategories(establishmentId?: string): Promise<Category[]> {
  const qs = establishmentId ? `?establishmentId=${establishmentId}` : '';
  return apiGet<Category[]>(`/categories${qs}`);
}

export async function getCategory(id: string): Promise<Category> {
  return apiGet<Category>(`/categories/${id}`);
}

export async function createCategory(dto: import('@/types/category').CreateCategoryDto, establishmentId: string): Promise<Category> {
  return apiPost<Category>(`/categories?establishmentId=${establishmentId}`, dto);
}

export async function updateCategory(id: string, dto: import('@/types/category').UpdateCategoryDto): Promise<Category> {
  return apiPatch<Category>(`/categories/${id}`, dto);
}

export async function deleteCategory(id: string): Promise<void> {
  return apiDelete(`/categories/${id}`);
}
