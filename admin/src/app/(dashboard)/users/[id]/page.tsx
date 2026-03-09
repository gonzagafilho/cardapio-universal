'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getUser, updateUser } from '@/services/user.service';
import { getEstablishments } from '@/services/establishment.service';
import { UserForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessUsers, canManageUsers } from '@/lib/permissions';
import type { User } from '@/types/user';
import type { UpdateUserDto } from '@/types/user';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const id = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [establishmentOptions, setEstablishmentOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getUser(id),
      getEstablishments().then((list) =>
        setEstablishmentOptions(list.map((e) => ({ value: e.id, label: e.name })))
      ),
    ])
      .then(([u]) => setUser(u))
      .catch(() => router.push('/users'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (!authUser) return null;
  if (!canAccessUsers(authUser.role)) {
    return <AccessDenied description="Seu perfil não pode acessar usuários." />;
  }

  const handleSubmit = async (dto: UpdateUserDto) => {
    if (!canManageUsers(authUser.role)) return;
    setSaving(true);
    try {
      await updateUser(id, dto);
      setUser((prev) => (prev ? { ...prev, ...dto } : null));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/users">
          <Button variant="ghost" size="sm">Voltar</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
      </div>
      <UserForm
        defaultValues={{
          ...user,
          establishmentId: user.establishmentId ?? undefined,
        }}
        establishmentOptions={establishmentOptions}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
