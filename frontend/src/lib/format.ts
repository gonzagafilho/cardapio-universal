export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pedido recebido',
    AWAITING_PAYMENT: 'Aguardando pagamento',
    PAID: 'Pago',
    CONFIRMED: 'Confirmado',
    PREPARING: 'Preparando',
    READY: 'Pronto',
    OUT_FOR_DELIVERY: 'Saiu para entrega',
    DELIVERED: 'Entregue',
    CANCELLED: 'Cancelado',
  };
  return labels[status] ?? status;
}
