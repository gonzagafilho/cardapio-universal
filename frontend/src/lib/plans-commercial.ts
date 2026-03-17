/**
 * Planos para exibição na página comercial.
 * Alinhado ao modelo de cobrança por quantidade de restaurantes (backend: pricing-restaurants).
 * 1 rest = R$ 159, 2 = R$ 278, 3 = R$ 397; cada adicional +R$ 119; trial 7 dias.
 */
export const COMMERCIAL_PLANS = [
  {
    key: 'basic',
    name: '1 restaurante',
    restaurantCount: 1,
    price: 'R$ 159/mês',
    features: [
      '1 restaurante incluído',
      'Até 3 usuários',
      'Cardápio online',
      'QR Code automático',
    ],
    recommended: false,
  },
  {
    key: 'pro',
    name: '2 restaurantes',
    restaurantCount: 2,
    price: 'R$ 278/mês',
    features: [
      '2 restaurantes incluídos',
      'Até 15 usuários',
      'Tudo do anterior',
      'Relatórios',
    ],
    recommended: true,
  },
  {
    key: 'enterprise',
    name: '3 restaurantes',
    restaurantCount: 3,
    price: 'R$ 397/mês',
    features: [
      '3 restaurantes incluídos',
      'Até 50 usuários',
      'Cada adicional +R$ 119/mês',
    ],
    recommended: false,
  },
];

/** Mensagem padrão: custo por restaurante adicional. */
export const PRICE_EXTRA_RESTAURANT = 'Cada restaurante adicional: +R$ 119/mês';

/** Mensagem padrão: trial. */
export const TRIAL_MESSAGE = '7 dias grátis para começar.';
