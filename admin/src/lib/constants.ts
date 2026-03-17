export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/** Base URL do WebSocket (mesmo host/porta da API, sem /api). Socket.IO usa path /socket.io. */
export const WS_BASE_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_WS_URL ?? new URL(API_BASE_URL).origin)
    : '';

/** URL base do app público (cardápio). Definir NEXT_PUBLIC_APP_URL em produção. */
export const APP_PUBLIC_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/** Host do app público (para instruções CNAME). Ex.: app.cardapio.nexoracloud.com.br */
export const APP_PUBLIC_HOST =
  process.env.NEXT_PUBLIC_APP_HOST ?? (typeof window !== 'undefined' ? new URL(APP_PUBLIC_URL).hostname : 'app.cardapio.nexoracloud.com.br');

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
