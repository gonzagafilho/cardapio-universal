/**
 * Limites por plano SaaS (espelho do backend para UI).
 * Usado em platform/tenants e settings para exibir plano e limites.
 */
export const PLAN_LIMITS = {
  basic: {
    establishments: 1,
    users: 3,
    label: 'Basic',
  },
  pro: {
    establishments: 5,
    users: 15,
    label: 'Pro',
  },
  enterprise: {
    establishments: 20,
    users: 50,
    label: 'Enterprise',
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
