'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getEstablishment, updateEstablishment } from '@/services/establishment.service';
import { EstablishmentForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessEstablishments, canCreateEstablishments } from '@/lib/permissions';
import type { Establishment } from '@/types/establishment';
import type { UpdateEstablishmentDto } from '@/types/establishment';

export default function EstablishmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEstablishment(id)
      .then(setEstablishment)
      .catch(() => router.push('/establishments'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (!user) return null;
  if (!canAccessEstablishments(user.role)) {
    return <AccessDenied description="Seu perfil não pode acessar estabelecimentos." />;
  }

  const handleSubmit = async (dto: UpdateEstablishmentDto) => {
    if (!canCreateEstablishments(user.role)) return;
    setSaving(true);
    try {
      await updateEstablishment(id, dto);
      setEstablishment((prev) => (prev ? { ...prev, ...dto } : null));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !establishment) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/establishments">
          <Button variant="ghost" size="sm">Voltar</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{establishment.name}</h1>
      </div>
      <EstablishmentForm
        defaultValues={{
          ...establishment,
          logoUrl: establishment.logoUrl ?? undefined,
          bannerUrl: establishment.bannerUrl ?? undefined,
          phone: establishment.phone ?? undefined,
          whatsapp: establishment.whatsapp ?? undefined,
          email: establishment.email ?? undefined,
          description: establishment.description ?? undefined,
          address: establishment.address ?? undefined,
          city: establishment.city ?? undefined,
          state: establishment.state ?? undefined,
          zipCode: establishment.zipCode ?? undefined,
        }}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
