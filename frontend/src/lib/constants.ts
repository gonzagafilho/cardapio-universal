export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const ORDER_TYPES = [
  { value: 'delivery', label: 'Entrega' },
  { value: 'pickup', label: 'Retirada' },
  { value: 'dine_in', label: 'Mesa' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'card', label: 'Cartão' },
  { value: 'cash', label: 'Dinheiro' },
] as const;

export const DAYS_OF_WEEK = [
  'dom',
  'seg',
  'ter',
  'qua',
  'qui',
  'sex',
  'sab',
] as const;

export const DAY_LABELS: Record<string, string> = {
  sun: 'Domingo',
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
  sat: 'Sábado',
};
