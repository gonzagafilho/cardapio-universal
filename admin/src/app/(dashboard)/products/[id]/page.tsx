'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getProduct, updateProduct } from '@/services/product.service';
import { getCategories } from '@/services/category.service';
import { ProductForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessProducts, canCreateProducts } from '@/lib/permissions';
import type { Product } from '@/types/product';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProduct(id)
      .then((p) => {
        setProduct(p);
        if (p?.establishmentId) {
          getCategories(p.establishmentId).then((cats) =>
            setCategoryOptions(cats.map((c) => ({ value: c.id, label: c.name })))
          );
        }
      })
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (!user) return null;
  if (!canAccessProducts(user.role)) {
    return <AccessDenied description="Seu perfil não pode acessar produtos." />;
  }

  const handleSubmit = async (dto: import('@/types/product').UpdateProductDto) => {
    if (!canCreateProducts(user.role)) return;
    setSaving(true);
    try {
      const updated = await updateProduct(id, dto);
      setProduct((prev) => (prev ? { ...prev, ...updated } : null));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !product) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/products">
          <Button variant="ghost" size="sm">Voltar</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
      </div>
      <ProductForm
        defaultValues={{
          ...product,
          description: product.description ?? undefined,
          imageUrl: product.imageUrl ?? undefined,
          promotionalPrice: product.promotionalPrice ?? undefined,
          sku: product.sku ?? undefined,
        }}
        categoryOptions={categoryOptions}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
