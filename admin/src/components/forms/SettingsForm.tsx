'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

export function SettingsForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  loading?: boolean;
}) {
  const [primaryColor, setPrimaryColor] = useState((defaultValues?.primaryColor as string) ?? '');
  const [minimumOrder, setMinimumOrder] = useState((defaultValues?.minimumOrder as number) ?? '');
  const [pixKey, setPixKey] = useState((defaultValues?.pixKey as string) ?? '');
  const [acceptsDelivery, setAcceptsDelivery] = useState((defaultValues?.acceptsDelivery as boolean) ?? true);
  const [acceptsPickup, setAcceptsPickup] = useState((defaultValues?.acceptsPickup as boolean) ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      primaryColor,
      minimumOrder: minimumOrder ? Number(minimumOrder) : undefined,
      pixKey,
      acceptsDelivery,
      acceptsPickup,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Cor primária"
        value={primaryColor}
        onChange={(e) => setPrimaryColor(e.target.value)}
        placeholder="#0f766e"
      />
      <Input
        label="Pedido mínimo (R$)"
        type="number"
        step="0.01"
        value={minimumOrder}
        onChange={(e) => setMinimumOrder(e.target.value === '' ? 0 : Number(e.target.value))}
      />
      <Input label="Chave PIX" value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={acceptsDelivery}
          onChange={(e) => setAcceptsDelivery(e.target.checked)}
        />
        <span className="text-sm">Aceita entrega</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={acceptsPickup}
          onChange={(e) => setAcceptsPickup(e.target.checked)}
        />
        <span className="text-sm">Aceita retirada</span>
      </label>
      <Button type="submit" loading={loading}>
        Salvar configurações
      </Button>
    </form>
  );
}
