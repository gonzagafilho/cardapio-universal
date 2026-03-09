'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ORDER_TYPES, PAYMENT_METHODS } from '@/lib/constants';
import type { OrderType } from '@/types/order';

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  reference: string;
  notes: string;
  orderType: OrderType;
  paymentMethod: string;
  changeFor?: string;
}

export interface CheckoutFormProps {
  defaultData?: Partial<CheckoutFormData>;
  onSubmit: (data: CheckoutFormData) => void;
  loading?: boolean;
  error?: string | null;
}

const initial: CheckoutFormData = {
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  addressNumber: '',
  complement: '',
  neighborhood: '',
  reference: '',
  notes: '',
  orderType: 'delivery',
  paymentMethod: 'pix',
};

export function CheckoutForm({
  defaultData,
  onSubmit,
  loading,
  error,
}: CheckoutFormProps) {
  const [data, setData] = useState<CheckoutFormData>({
    ...initial,
    ...defaultData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const showAddress = data.orderType === 'delivery';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome"
        required
        value={data.customerName}
        onChange={(e) => setData((d) => ({ ...d, customerName: e.target.value }))}
        placeholder="Seu nome"
      />
      <Input
        label="Telefone"
        required
        type="tel"
        value={data.customerPhone}
        onChange={(e) => setData((d) => ({ ...d, customerPhone: e.target.value }))}
        placeholder="(00) 00000-0000"
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Tipo do pedido
        </label>
        <div className="flex gap-2">
          {ORDER_TYPES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-1">
              <input
                type="radio"
                name="orderType"
                value={value}
                checked={data.orderType === value}
                onChange={() =>
                  setData((d) => ({ ...d, orderType: value as OrderType }))
                }
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {showAddress && (
        <>
          <Input
            label="Endereço"
            required
            value={data.deliveryAddress}
            onChange={(e) =>
              setData((d) => ({ ...d, deliveryAddress: e.target.value }))
            }
            placeholder="Rua, avenida..."
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Número"
              required
              value={data.addressNumber}
              onChange={(e) =>
                setData((d) => ({ ...d, addressNumber: e.target.value }))
              }
              placeholder="Nº"
            />
            <Input
              label="Bairro"
              required
              value={data.neighborhood}
              onChange={(e) =>
                setData((d) => ({ ...d, neighborhood: e.target.value }))
              }
              placeholder="Bairro"
            />
          </div>
          <Input
            label="Complemento"
            value={data.complement}
            onChange={(e) =>
              setData((d) => ({ ...d, complement: e.target.value }))
            }
            placeholder="Apto, bloco..."
          />
          <Input
            label="Referência"
            value={data.reference}
            onChange={(e) =>
              setData((d) => ({ ...d, reference: e.target.value }))
            }
            placeholder="Ponto de referência"
          />
        </>
      )}

      <Textarea
        label="Observações do pedido"
        value={data.notes}
        onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
        placeholder="Alguma instrução especial?"
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Forma de pagamento
        </label>
        <div className="space-y-2">
          {PAYMENT_METHODS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value={value}
                checked={data.paymentMethod === value}
                onChange={() =>
                  setData((d) => ({ ...d, paymentMethod: value }))
                }
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {data.paymentMethod === 'cash' && (
        <Input
          label="Troco para"
          value={data.changeFor ?? ''}
          onChange={(e) =>
            setData((d) => ({ ...d, changeFor: e.target.value }))
          }
          placeholder="Ex: R$ 50,00"
        />
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" fullWidth size="lg" loading={loading}>
        Confirmar pedido
      </Button>
    </form>
  );
}
