'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { EstablishmentForm } from '@/components/forms';
import { createEstablishment } from '@/services/establishment.service';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessEstablishments, canCreateEstablishments } from '@/lib/permissions';
import { useState } from 'react';
import type { ApiError } from '@/services/api';

export default function NewEstablishmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;
  if (!canAccessEstablishments(user.role)) {
    return <AccessDenied description="Seu perfil não pode acessar estabelecimentos." />;
  }
  if (!canCreateEstablishments(user.role)) {
    return <AccessDenied description="Seu perfil não pode criar estabelecimentos." />;
  }

  const handleSubmit = async (dto: import('@/types/establishment').CreateEstablishmentDto) => {
    setLoading(true);
    setError(null);
    try {
      await createEstablishment(dto);
      router.push('/establishments');
    } catch (err) {
      const msg = (err as ApiError)?.message ?? 'Não foi possível criar o restaurante.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Novo restaurante</h1>
      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>{error}</p>
          {error.includes('Assinatura') ? (
            <Link href="/billing" className="mt-2 inline-block font-medium text-amber-800 underline hover:text-amber-900">
              Ir para Assinatura
            </Link>
          ) : null}
        </div>
      ) : null}
      <EstablishmentForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
