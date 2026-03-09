'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getCategory, updateCategory } from '@/services/category.service';
import { CategoryForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessCategories, canCreateCategories } from '@/lib/permissions';
import type { Category, UpdateCategoryDto } from '@/types/category';

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategory(id)
      .then(setCategory)
      .catch(() => router.push('/categories'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (!user) return null;
  if (!canAccessCategories(user.role)) {
    return <AccessDenied description="Seu perfil não pode acessar categorias." />;
  }

  const handleSubmit = async (dto: UpdateCategoryDto) => {
    if (!canCreateCategories(user.role)) return;
    setSaving(true);
    try {
      await updateCategory(id, dto);
      setCategory((prev) => (prev ? { ...prev, ...dto } : null));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !category) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/categories">
          <Button variant="ghost" size="sm">← Voltar</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
      </div>
      <CategoryForm
        defaultValues={{
          ...category,
          description: category.description ?? undefined,
        }}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
