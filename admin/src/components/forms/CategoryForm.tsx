'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CreateCategoryDto } from '@/types/category';

export function CategoryForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<CreateCategoryDto>;
  onSubmit: (dto: CreateCategoryDto) => void;
  loading?: boolean;
}) {
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [sortOrder, setSortOrder] = useState(defaultValues?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, sortOrder, isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input
        label="Ordem"
        type="number"
        value={sortOrder}
        onChange={(e) => setSortOrder(Number(e.target.value))}
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
