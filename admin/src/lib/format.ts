export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR');
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR');
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    AWAITING_PAYMENT: 'Aguardando pagamento',
    PAID: 'Pago',
    CONFIRMED: 'Confirmado',
    PREPARING: 'Preparando',
    READY: 'Pronto',
    OUT_FOR_DELIVERY: 'Saiu para entrega',
    DELIVERED: 'Entregue',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
  };
  return labels[status] ?? status;
}
