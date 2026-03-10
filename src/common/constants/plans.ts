/**
 * Limites por plano SaaS (Nexora).
 * Valores alinhados com Tenant.plan: basic, pro, enterprise.
 * Não implementa billing; apenas regras de uso.
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

export function getPlanLimits(plan: string | null | undefined): {
  establishments: number;
  users: number;
  label: string;
} {
  const key = (plan ?? 'basic').toLowerCase() as PlanKey;
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.basic;
}
