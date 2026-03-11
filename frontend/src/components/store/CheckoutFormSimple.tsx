'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ORDER_TYPES } from '@/lib/constants';
import type { OrderType } from '@/types/order';

export interface CheckoutFormSimpleData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderType: OrderType;
  notes: string;
}

export interface CheckoutFormSimpleProps {
  defaultData?: Partial<CheckoutFormSimpleData>;
  onSubmit: (data: CheckoutFormSimpleData) => void;
  loading?: boolean;
  error?: string | null;
}

const initial: CheckoutFormSimpleData = {
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  orderType: 'delivery',
  notes: '',
};

export function CheckoutFormSimple({
  defaultData,
  onSubmit,
  loading,
  error,
}: CheckoutFormSimpleProps) {
  const [data, setData] = useState<CheckoutFormSimpleData>({
    ...initial,
    ...defaultData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const showAddress = data.orderType === 'delivery';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Nome"
        required
        value={data.customerName}
        onChange={(e) => setData((d) => ({ ...d, customerName: e.target.value }))}
        placeholder="Seu nome completo"
        className="rounded-xl border-gray-200"
      />
      <Input
        label="Telefone"
        required
        type="tel"
        value={data.customerPhone}
        onChange={(e) => setData((d) => ({ ...d, customerPhone: e.target.value }))}
        placeholder="(00) 00000-0000"
        className="rounded-xl border-gray-200"
      />
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Tipo do pedido
        </label>
        <div className="flex flex-wrap gap-3">
          {ORDER_TYPES.map(({ value, label }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                data.orderType === value
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="orderType"
                value={value}
                checked={data.orderType === value}
                onChange={() =>
                  setData((d) => ({ ...d, orderType: value as OrderType }))
                }
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
      {showAddress && (
        <Input
          label="Endereço de entrega"
          required
          value={data.deliveryAddress}
          onChange={(e) =>
            setData((d) => ({ ...d, deliveryAddress: e.target.value }))
          }
          placeholder="Rua, número, bairro, cidade..."
          className="rounded-xl border-gray-200"
        />
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Observação geral (opcional)
        </label>
        <Textarea
          value={data.notes}
          onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
          placeholder="Ex: sem cebola, ponto da carne ao ponto, entregar na portaria..."
          rows={3}
          className="rounded-xl border-gray-200 resize-none"
        />
      </div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}
      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={loading}
        className="rounded-xl bg-gray-900 hover:bg-gray-800"
      >
        {loading ? 'Enviando...' : 'Enviar pedido'}
      </Button>
    </form>
  );
}
