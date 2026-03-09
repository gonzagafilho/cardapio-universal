'use client';

import { useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { ROLES } from '@/lib/permissions';
import type { CreateUserDto } from '@/types/user';

const roleOptions = ROLES.map((r) => ({ value: r, label: r }));

export function UserForm({
  defaultValues,
  establishmentOptions,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<CreateUserDto>;
  establishmentOptions: { value: string; label: string }[];
  onSubmit: (dto: CreateUserDto) => void;
  loading?: boolean;
}) {
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [email, setEmail] = useState(defaultValues?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<CreateUserDto['role']>(defaultValues?.role ?? 'ATTENDANT');
  const [establishmentId, setEstablishmentId] = useState(defaultValues?.establishmentId ?? '');
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      password: password || undefined!,
      role,
      establishmentId: establishmentId || undefined,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input
        label="E-mail"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={defaultValues ? 'Deixe em branco para manter' : undefined}
      />
      <Select
        label="Perfil"
        value={role}
        onChange={(e) => setRole(e.target.value as CreateUserDto['role'])}
        options={roleOptions}
      />
      <Select
        label="Estabelecimento"
        value={establishmentId}
        onChange={(e) => setEstablishmentId(e.target.value)}
        options={[{ value: '', label: 'Nenhum' }, ...establishmentOptions]}
      />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className="text-sm">Ativo</span>
      </label>
      <Button type="submit" loading={loading}>
        Salvar
      </Button>
    </form>
  );
}
