'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCoupon, updateCoupon } from '@/services/coupon.service';
import { CouponForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import type { Coupon } from '@/types/coupon';
import type { UpdateCouponDto } from '@/types/coupon';

export default function CouponDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCoupon(id)
      .then(setCoupon)
      .catch(() => router.push('/coupons'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (dto: UpdateCouponDto) => {
    setSaving(true);
    try {
      await updateCoupon(id, dto);
      setCoupon((prev) => (prev ? { ...prev, ...dto } : null));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !coupon) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/coupons">
          <Button variant="ghost" size="sm">Voltar</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{coupon.code}</h1>
      </div>
      <CouponForm
        defaultValues={{
          ...coupon,
          minOrderValue: coupon.minOrderValue ?? undefined,
          maxDiscount: coupon.maxDiscount ?? undefined,
          usageLimit: coupon.usageLimit ?? undefined,
        }}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
