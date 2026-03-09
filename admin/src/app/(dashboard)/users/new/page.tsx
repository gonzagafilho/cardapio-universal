'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getEstablishments } from '@/services/establishment.service';
import { createUser } from '@/services/user.service';
import { UserForm } from '@/components/forms';
import { LoadingPage } from '@/components/ui/loading';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessUsers, canManageUsers } from '@/lib/permissions';

export default function NewUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [establishmentOptions, setEstablishmentOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEst, setLoadingEst] = useState(true);

  useEffect(() => {
    getEstablishments()
      .then((list) => setEstablishmentOptions(list.map((e) => ({ value: e.id, label: e.name }))))
      .finally(() => setLoadingEst(false));
  }, []);

  if (!user) return null;
  if (!canAccessUsers(user.role)) {
    return <AccessDenied description="Seu perfil não pode acessar usuários." />;
  }
  if (!canManageUsers(user.role)) {
    return <AccessDenied description="Seu perfil não pode criar ou editar usuários." />;
  }

  const handleSubmit = async (dto: import('@/types/user').CreateUserDto) => {
    setLoading(true);
    try {
      await createUser(dto);
      router.push('/users');
    } finally {
      setLoading(false);
    }
  };

  if (loadingEst) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Novo usuário</h1>
      <UserForm establishmentOptions={establishmentOptions} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
