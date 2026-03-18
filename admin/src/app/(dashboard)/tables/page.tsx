'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { LoadingPage } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type Column } from '@/components/tables';
import { Badge } from '@/components/ui/badge';
import { getEstablishmentTables, createEstablishmentTable, regenerateEstablishmentTableToken } from '@/services/table.service';
import { getEstablishment } from '@/services/establishment.service';
import { canAccessTables } from '@/lib/permissions';
import type { Table } from '@/types/table';
import type { Establishment } from '@/types/establishment';

export default function TablesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Table[]>([]);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const canView = user ? canAccessTables(user.role) : false;
  const establishmentId = user?.establishmentId ?? null;

  const refresh = async () => {
    if (!establishmentId) return;
    const data = await getEstablishmentTables(establishmentId);
    setList(data ?? []);
  };

  useEffect(() => {
    if (!user || !canView || !establishmentId) {
      setLoading(false);
      return;
    }
    Promise.all([refresh(), getEstablishment(establishmentId).then(setEstablishment)])
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, canView, establishmentId]);

  if (!user) return null;
  if (loading) return <LoadingPage />;
  if (!canView) return <AccessDenied description="Seu perfil não pode acessar esta área." />;

  const handleCreate = async () => {
    if (!establishmentId) return;
    const n = name.trim();
    if (!n) return;
    setSaving(true);
    try {
      await createEstablishmentTable(establishmentId, { name: n, number: number.trim() || undefined });
      setName('');
      setNumber('');
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async (tableId: string) => {
    if (!establishmentId) return;
    await regenerateEstablishmentTableToken(establishmentId, tableId);
    await refresh();
  };

  const columns: Column<Table>[] = [
    { key: 'name', header: 'Nome' },
    { key: 'number', header: 'Número' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row: Table) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      key: 'token',
      header: 'Link/Token',
      render: (row: Table) => {
        if (!row.token) {
          return (
            <Button variant="ghost" size="sm" onClick={() => handleRegenerate(row.id)}>
              Gerar token
            </Button>
          );
        }
        const href = establishment?.slug ? `/${establishment.slug}?table=${row.token}` : `?table=${row.token}`;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-700">{row.token}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard?.writeText(href)}
            >
              Copiar link
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleRegenerate(row.id)}>
              Regenerar
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Mesas / Comandas</h1>

      {!establishmentId ? (
        <AccessDenied description="Usuário sem estabelecimento vinculado." />
      ) : (
        <>
          <div className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Criar mesa</h2>
            <div className="flex flex-col gap-3 md:flex-row">
              <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Mesa 01" />
              <Input label="Número (opcional)" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="01" />
              <div className="flex items-end">
                <Button onClick={handleCreate} loading={saving} disabled={!name.trim()}>
                  Criar
                </Button>
              </div>
            </div>
          </div>

          <DataTable<Table>
            columns={columns}
            data={list}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma mesa cadastrada."
          />
        </>
      )}
    </div>
  );
}

