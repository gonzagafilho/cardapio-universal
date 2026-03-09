export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const TOKEN_KEY = 'admin_access_token';
export const REFRESH_TOKEN_KEY = 'admin_refresh_token';
export const USER_KEY = 'admin_user';

export const ORDER_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'READY', label: 'Pronto' },
  { value: 'OUT_FOR_DELIVERY', label: 'Saiu para entrega' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
];
