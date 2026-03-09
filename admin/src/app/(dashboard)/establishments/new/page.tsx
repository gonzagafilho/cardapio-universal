'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { EstablishmentForm } from '@/components/forms';
import { createEstablishment } from '@/services/establishment.service';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessEstablishments, canCreateEstablishments } from '@/lib/permissions';
import { useState } from 'react';

export default function NewEstablishmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user) return null;
  if (!canAccessEstablishments(user.role)) {
    return <AccessDenied description="Seu perfil não pode acessar estabelecimentos." />;
  }
  if (!canCreateEstablishments(user.role)) {
    return <AccessDenied description="Seu perfil não pode criar estabelecimentos." />;
  }

  const handleSubmit = async (dto: import('@/types/establishment').CreateEstablishmentDto) => {
    setLoading(true);
    try {
      await createEstablishment(dto);
      router.push('/establishments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Novo estabelecimento</h1>
      <EstablishmentForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
