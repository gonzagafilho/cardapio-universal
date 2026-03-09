'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CouponForm } from '@/components/forms';
import { createCoupon } from '@/services/coupon.service';
import { useState } from 'react';
import type { CreateCouponDto } from '@/types/coupon';

export default function NewCouponPage() {
  const router = useRouter();
  const { user } = useAuth();
  const establishmentId = user?.establishmentId ?? '';
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (dto: CreateCouponDto) => {
    setLoading(true);
    try {
      await createCoupon(dto, establishmentId);
      router.push('/coupons');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Novo cupom</h1>
      <CouponForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
