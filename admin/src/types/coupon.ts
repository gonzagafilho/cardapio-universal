export interface Coupon {
  id: string;
  tenantId: string;
  establishmentId: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  startsAt: string;
  endsAt: string;
  usageLimit: number | null;
  isActive: boolean;
}

export interface CreateCouponDto {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startsAt: string;
  endsAt: string;
  usageLimit?: number;
  isActive?: boolean;
}

export interface UpdateCouponDto extends Partial<CreateCouponDto> {}
