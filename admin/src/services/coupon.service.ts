import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Coupon, CreateCouponDto, UpdateCouponDto } from '@/types/coupon';

export async function getCoupons(establishmentId?: string): Promise<Coupon[]> {
  const qs = establishmentId ? `?establishmentId=${establishmentId}` : '';
  return apiGet<Coupon[]>(`/coupons${qs}`);
}

export async function getCoupon(id: string): Promise<Coupon> {
  return apiGet<Coupon>(`/coupons/${id}`);
}

export async function createCoupon(dto: CreateCouponDto, establishmentId: string): Promise<Coupon> {
  return apiPost<Coupon>(`/coupons?establishmentId=${establishmentId}`, dto);
}

export async function updateCoupon(id: string, dto: UpdateCouponDto): Promise<Coupon> {
  return apiPatch<Coupon>(`/coupons/${id}`, dto);
}

export async function deleteCoupon(id: string): Promise<void> {
  return apiDelete(`/coupons/${id}`);
}
