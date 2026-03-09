'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCategories } from '@/services/category.service';
import { createProduct } from '@/services/product.service';
import { ProductForm } from '@/components/forms';
import { LoadingPage } from '@/components/ui/loading';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessProducts, canCreateProducts } from '@/lib/permissions';

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const establishmentId = user?.establishmentId ?? '';
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCat, setLoadingCat] = useState(true);

  useEffect(() => {
    getCategories(establishmentId)
      .then((cats) => setCategoryOptions(cats.map((c) => ({ value: c.id, label: c.name }))))
      .finally(() => setLoadingCat(false));
  }, [establishmentId]);

  if (!user) return null;
  if (!canAccessProducts(user.role)) {
    return <AccessDenied description="Seu perfil não pode acessar produtos." />;
  }
  if (!canCreateProducts(user.role)) {
    return <AccessDenied description="Seu perfil não pode criar produtos." />;
  }

  const handleSubmit = async (dto: import('@/types/product').CreateProductDto) => {
    setLoading(true);
    try {
      await createProduct(dto, establishmentId);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCat) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Novo produto</h1>
      <ProductForm categoryOptions={categoryOptions} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
