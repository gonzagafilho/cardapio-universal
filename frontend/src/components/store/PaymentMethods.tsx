'use client';

import { PAYMENT_METHODS } from '@/lib/constants';

export interface PaymentMethodsProps {
  value: string;
  onChange: (value: string) => void;
}

export function PaymentMethods({ value, onChange }: PaymentMethodsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        Selecione a forma de pagamento
      </p>
      {PAYMENT_METHODS.map(({ value: v, label }) => (
        <label
          key={v}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5"
        >
          <input
            type="radio"
            name="paymentMethod"
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="text-primary focus:ring-primary"
          />
          <span className="font-medium text-gray-900">{label}</span>
        </label>
      ))}
    </div>
  );
}
