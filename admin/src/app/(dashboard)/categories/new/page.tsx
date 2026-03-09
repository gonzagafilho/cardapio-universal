'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CategoryForm } from '@/components/forms';
import { createCategory } from '@/services/category.service';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessCategories, canCreateCategories } from '@/lib/permissions';
import { useState } from 'react';

export default function NewCategoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const establishmentId = user?.establishmentId ?? '';
  const [loading, setLoading] = useState(false);

  if (!user) return null;
  if (!canAccessCategories(user.role)) {
    return <AccessDenied description="Seu perfil não pode acessar categorias." />;
  }
  if (!canCreateCategories(user.role)) {
    return <AccessDenied description="Seu perfil não pode criar categorias." />;
  }

  const handleSubmit = async (dto: import('@/types/category').CreateCategoryDto) => {
    setLoading(true);
    try {
      await createCategory(dto, establishmentId);
      router.push('/categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Nova categoria</h1>
      <CategoryForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
