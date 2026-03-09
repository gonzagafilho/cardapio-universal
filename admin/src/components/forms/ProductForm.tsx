'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import type { CreateProductDto } from '@/types/product';

export function ProductForm({
  defaultValues,
  categoryOptions,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<CreateProductDto>;
  categoryOptions: { value: string; label: string }[];
  onSubmit: (dto: CreateProductDto) => void;
  loading?: boolean;
}) {
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [price, setPrice] = useState(defaultValues?.price ?? 0);
  const [promotionalPrice, setPromotionalPrice] = useState(defaultValues?.promotionalPrice ?? '');
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? '');
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(defaultValues?.isFeatured ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      price: Number(price),
      promotionalPrice: promotionalPrice ? Number(promotionalPrice) : undefined,
      categoryId,
      isActive,
      isFeatured,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Select
        label="Categoria"
        required
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        options={[{ value: '', label: 'Selecione' }, ...categoryOptions]}
      />
      <Input
        label="Preço (R$)"
        type="number"
        step="0.01"
        required
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />
      <Input
        label="Preço promocional (R$)"
        type="number"
        step="0.01"
        value={promotionalPrice}
        onChange={(e) => setPromotionalPrice(e.target.value)}
      />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className="text-sm">Ativo</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
        <span className="text-sm">Destaque</span>
      </label>
      <Button type="submit" loading={loading}>
        Salvar
      </Button>
    </form>
  );
}
