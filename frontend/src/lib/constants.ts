export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/** Host padrão do app público (landing / slug). Outro host = subdomínio ou domínio customizado. */
export const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST ?? 'localhost';

/** Host base do menu (ex.: menu.cardapio.nexoracloud.com.br). Quando o visitante acessa esse host exato, vê página premium em vez de DomainNotFound. Deixe vazio para não usar. */
export const MENU_BASE_HOST = (process.env.NEXT_PUBLIC_MENU_BASE_HOST ?? '').toLowerCase().trim();

/** URL base do app público (para links "Voltar ao site" em 404 de domínio). Defina NEXT_PUBLIC_APP_URL em produção. */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? `https://${APP_HOST}`;

/** URL base do admin (para CTAs: Entrar, Criar conta / onboarding). */
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://admin.cardapio.nexoracloud.com.br';

/** WhatsApp comercial (NEXORA): número com DDI, ex. 5511999999999. Gera link wa.me para CTA "Falar no WhatsApp". */
export const WHATSAPP_COMERCIAL =
  process.env.NEXT_PUBLIC_WHATSAPP_COMERCIAL?.trim() ?? '';
export const WHATSAPP_COMERCIAL_URL = WHATSAPP_COMERCIAL
  ? `https://wa.me/${WHATSAPP_COMERCIAL.replace(/\D/g, '')}`
  : '';

/** Slug da loja para páginas públicas /menu e /product (quando não há [storeSlug] na URL). */
export const DEFAULT_STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG ?? '';

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
