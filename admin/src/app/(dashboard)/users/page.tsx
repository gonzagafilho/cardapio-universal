'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getUsers } from '@/services/user.service';
import { DataTable, type Column } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessUsers, canManageUsers } from '@/lib/permissions';
import type { User } from '@/types/user';

export default function UsersPage() {
  const { user } = useAuth();
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const canView = user ? canAccessUsers(user.role) : false;
  const canCreate = user ? canManageUsers(user.role) : false;

  useEffect(() => {
    if (!user || !canView) {
      setLoading(false);
      return;
    }
    getUsers().then(setList).finally(() => setLoading(false));
  }, [user, canView]);

  if (!user) return null;

  if (loading) return <LoadingPage />;

  if (!canView) {
    return <AccessDenied description="Seu perfil não pode acessar usuários." />;
  }

  const columns: Column<User>[] = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    { key: 'role', header: 'Perfil' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row: User) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    ...(canCreate
      ? [
          {
            key: 'id' as const,
            header: '',
            render: (row: User) => (
              <Link href={`/users/${row.id}`}>
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
              </Link>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        {canCreate && (
          <Link href="/users/new">
            <Button>Novo usuário</Button>
          </Link>
        )}
      </div>
      <DataTable<User>
        columns={columns}
        data={list}
        keyExtractor={(r) => r.id}
        emptyMessage="Nenhum usuário."
      />
    </div>
  );
}
