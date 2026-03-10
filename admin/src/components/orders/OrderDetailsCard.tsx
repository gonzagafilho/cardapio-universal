'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/format';
import type { Order } from '@/types/order';

export function OrderDetailsCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Pedido #{order.code ?? order.orderNumber ?? order.id}</h3>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="text-gray-500">Cliente:</span> {order.customerName ?? '-'}
        </p>
        <p>
          <span className="text-gray-500">Telefone:</span> {order.customerPhone ?? '-'}
        </p>
        <p>
          <span className="text-gray-500">Tipo:</span> {order.type}
        </p>
        {order.table && (
          <p>
            <span className="text-gray-500">Mesa/comanda:</span> {order.table.name}
            {order.table.number ? ` (${order.table.number})` : ''}
          </p>
        )}
        <p>
          <span className="text-gray-500">Pagamento:</span> {order.paymentMethod ?? '-'}
        </p>
        <p>
          <span className="text-gray-500">Criado em:</span> {formatDateTime(order.createdAt)}
        </p>
        <p className="pt-2 font-medium">
          Total: {formatCurrency(Number(order.total))}
        </p>
      </CardContent>
    </Card>
  );
}
