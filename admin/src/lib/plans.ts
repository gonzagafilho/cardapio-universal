/**
 * Limites por plano SaaS (espelho do backend para UI).
 * Alinhado ao modelo por quantidade de restaurantes: 1, 2, 3 (backend: plans.ts + pricing-restaurants).
 */
export const PLAN_LIMITS = {
  basic: {
    establishments: 1,
    users: 3,
    label: '1 restaurante',
  },
  pro: {
    establishments: 2,
    users: 15,
    label: '2 restaurantes',
  },
  enterprise: {
    establishments: 3,
    users: 50,
    label: '3 restaurantes',
  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

export const PLAN_OPTIONS: { value: PlanKey; label: string }[] = [
  { value: 'basic', label: PLAN_LIMITS.basic.label },
  { value: 'pro', label: PLAN_LIMITS.pro.label },
  { value: 'enterprise', label: PLAN_LIMITS.enterprise.label },
];

export function getPlanLimits(plan: string | null | undefined): {
  establishments: number;
  users: number;
  label: string;
} {
  const key = (plan ?? 'basic').toLowerCase() as PlanKey;
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.basic;
}
