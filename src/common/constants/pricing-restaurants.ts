/**
 * Precificação por quantidade de restaurantes — NEXORA.
 * Fonte única para: onboarding, /planos, billing, validação de limite.
 *
 * Modelo:
 * - 1 restaurante = R$ 159/mês
 * - 2 restaurantes = R$ 278/mês
 * - 3 restaurantes = R$ 397/mês
 * - cada restaurante adicional = +R$ 119/mês
 * - Trial: 7 dias grátis (já usado no onboarding).
 */

/** Preço base para 1 restaurante (R$/mês). */
export const PRICE_ONE_RESTAURANT = 159;

/** Tabela de preço para 2 e 3 restaurantes (R$/mês). */
export const PRICE_BY_RESTAURANT_COUNT: Record<number, number> = {
  1: 159,
  2: 278,
  3: 397,
};

/** Valor por restaurante adicional (acima de 3). R$/mês. */
export const PRICE_PER_EXTRA_RESTAURANT = 119;

/** Duração do trial para novos tenants (dias). */
export const TRIAL_DAYS = 7;

/** Plan key (Tenant.plan) → quantidade de restaurantes incluídos. */
export const PLAN_KEY_TO_RESTAURANT_COUNT: Record<string, number> = {
  basic: 1,
  pro: 2,
  enterprise: 3,
};

/**
 * Retorna o valor mensal em R$ para a quantidade de restaurantes.
 * Usado em billing (checkout) e exibição comercial.
 */
export function getMonthlyAmountByRestaurantCount(restaurantCount: number): number {
  if (restaurantCount < 1) return PRICE_ONE_RESTAURANT;
  const table = PRICE_BY_RESTAURANT_COUNT[restaurantCount];
  if (table != null) return table;
  const base3 = PRICE_BY_RESTAURANT_COUNT[3] ?? 397;
  return base3 + (restaurantCount - 3) * PRICE_PER_EXTRA_RESTAURANT;
}

/**
 * Retorna o valor mensal em R$ para o plano (basic/pro/enterprise).
 * Equivalente a getMonthlyAmountByRestaurantCount(getRestaurantCountForPlan(plan)).
 */
export function getMonthlyAmountForPlan(plan: string | null | undefined): number {
  const count = getRestaurantCountForPlan(plan);
  return getMonthlyAmountByRestaurantCount(count);
}

/**
 * Retorna a quantidade de restaurantes incluída no plano.
 * Usado para limite de establishments e para cálculo de preço.
 */
export function getRestaurantCountForPlan(plan: string | null | undefined): number {
  const key = (plan ?? 'basic').toLowerCase();
  return PLAN_KEY_TO_RESTAURANT_COUNT[key] ?? 1;
}

/**
 * Estrutura para expor via API (GET /billing/pricing).
 */
export function getPricingPublic(): {
  priceOneRestaurant: number;
  priceByRestaurantCount: Record<number, number>;
  pricePerExtraRestaurant: number;
  trialDays: number;
  planKeys: Array<{ key: string; restaurantCount: number; monthlyAmount: number }>;
} {
  const planKeys = ['basic', 'pro', 'enterprise'] as const;
  return {
    priceOneRestaurant: PRICE_ONE_RESTAURANT,
    priceByRestaurantCount: { ...PRICE_BY_RESTAURANT_COUNT },
    pricePerExtraRestaurant: PRICE_PER_EXTRA_RESTAURANT,
    trialDays: TRIAL_DAYS,
    planKeys: planKeys.map((key) => ({
      key,
      restaurantCount: getRestaurantCountForPlan(key),
      monthlyAmount: getMonthlyAmountForPlan(key),
    })),
  };
}
