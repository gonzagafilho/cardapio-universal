'use client';

import { formatCurrency } from '@/lib/currency';

export interface CartSummaryProps {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export function CartSummary({
  subtotal,
  discount,
  deliveryFee,
  total,
}: CartSummaryProps) {
  return (
    <div className="mt-4 border-t border-gray-100 pt-4 space-y-2 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Desconto</span>
          <span className="font-medium">-{formatCurrency(discount)}</span>
        </div>
      )}
      {deliveryFee > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>Taxa de entrega</span>
          <span className="font-medium text-gray-900">{formatCurrency(deliveryFee)}</span>
        </div>
      )}
      <div className="flex justify-between pt-3 text-base font-semibold text-gray-900 border-t border-gray-100">
        <span>Total</span>
        <span className="text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
