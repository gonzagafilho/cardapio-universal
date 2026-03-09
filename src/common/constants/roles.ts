/**
 * Roles do painel administrativo.
 * Prisma enum (schema): SUPER_ADMIN, TENANT_OWNER, TENANT_ADMIN, TENANT_STAFF.
 * Mantidos MANAGER, ATTENDANT, OPERATOR para compatibilidade com controllers
 * existentes; mapeie para TENANT_ADMIN / TENANT_STAFF no banco se necessário.
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT_OWNER: 'TENANT_OWNER',
  TENANT_ADMIN: 'TENANT_ADMIN',
  TENANT_STAFF: 'TENANT_STAFF',
  MANAGER: 'MANAGER',
  ATTENDANT: 'ATTENDANT',
  OPERATOR: 'OPERATOR',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.TENANT_OWNER]: 90,
  [ROLES.TENANT_ADMIN]: 70,
  [ROLES.TENANT_STAFF]: 50,
  [ROLES.MANAGER]: 70,
  [ROLES.ATTENDANT]: 50,
  [ROLES.OPERATOR]: 30,
};
