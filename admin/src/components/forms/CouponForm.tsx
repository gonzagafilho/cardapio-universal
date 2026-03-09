'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { CreateCouponDto } from '@/types/coupon';

export function CouponForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<CreateCouponDto>;
  onSubmit: (dto: CreateCouponDto) => void;
  loading?: boolean;
}) {
  const [code, setCode] = useState(defaultValues?.code ?? '');
  const [type, setType] = useState<'percentage' | 'fixed'>(defaultValues?.type ?? 'percentage');
  const [value, setValue] = useState(defaultValues?.value ?? 0);
  const [minOrderValue, setMinOrderValue] = useState(defaultValues?.minOrderValue ?? '');
  const [startsAt, setStartsAt] = useState(defaultValues?.startsAt?.slice(0, 16) ?? '');
  const [endsAt, setEndsAt] = useState(defaultValues?.endsAt?.slice(0, 16) ?? '');
  const [usageLimit, setUsageLimit] = useState(defaultValues?.usageLimit ?? '');
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code,
      type,
      value: Number(value),
      minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Código" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
      <Select
        label="Tipo"
        value={type}
        onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
        options={[
          { value: 'percentage', label: 'Percentual' },
          { value: 'fixed', label: 'Valor fixo' },
        ]}
      />
      <Input
        label={type === 'percentage' ? 'Valor (%)' : 'Valor (R$)'}
        type="number"
        step="0.01"
        required
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <Input
        label="Pedido mínimo (R$)"
        type="number"
        step="0.01"
        value={minOrderValue}
        onChange={(e) => setMinOrderValue(e.target.value)}
      />
      <Input
        label="Início"
        type="datetime-local"
        value={startsAt}
        onChange={(e) => setStartsAt(e.target.value)}
      />
      <Input label="Fim" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
      <Input
        label="Limite de uso"
        type="number"
        value={usageLimit}
        onChange={(e) => setUsageLimit(e.target.value)}
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
