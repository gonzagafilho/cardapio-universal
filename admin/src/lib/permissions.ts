import type { Role } from '@/types/auth';

export const ROLES: Role[] = [
  'SUPER_ADMIN',
  'TENANT_OWNER',
  'TENANT_ADMIN',
  'MANAGER',
  'TENANT_STAFF',
  'ATTENDANT',
  'OPERATOR',
];

const ROLE_LEVEL: Record<Role, number> = {
  SUPER_ADMIN: 100,
  TENANT_OWNER: 90,
  TENANT_ADMIN: 80,
  MANAGER: 70,
  TENANT_STAFF: 60,
  ATTENDANT: 50,
  OPERATOR: 30,
};

export type AppPermission =
  | 'dashboard.view'
  | 'establishments.view'
  | 'categories.view'
  | 'products.view'
  | 'orders.view'
  | 'customers.view'
  | 'payments.view'
  | 'coupons.view'
  | 'reports.view'
  | 'settings.view'
  | 'users.view'
  | 'establishments.create'
  | 'categories.create'
  | 'products.create'
  | 'users.manage'
  | 'platform.view'
  | 'billing.view';

type MenuItem = {
  path: string;
  label: string;
  permission: AppPermission;
  check: (role: Role) => boolean;
};

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
}

const PERMISSIONS_BY_ROLE: Record<Role, AppPermission[]> = {
  SUPER_ADMIN: [
    'dashboard.view',
    'establishments.view',
    'categories.view',
    'products.view',
    'orders.view',
    'customers.view',
    'payments.view',
    'coupons.view',
    'reports.view',
    'settings.view',
    'users.view',
    'establishments.create',
    'categories.create',
    'products.create',
    'users.manage',
    'platform.view',
    'billing.view',
  ],
  TENANT_OWNER: [
    'dashboard.view',
    'establishments.view',
    'categories.view',
    'products.view',
    'orders.view',
    'customers.view',
    'payments.view',
    'coupons.view',
    'reports.view',
    'settings.view',
    'users.view',
    'establishments.create',
    'categories.create',
    'products.create',
    'users.manage',
    'billing.view',
  ],
  TENANT_ADMIN: [
    'dashboard.view',
    'categories.view',
    'products.view',
    'orders.view',
    'customers.view',
    'payments.view',
    'coupons.view',
    'reports.view',
    'settings.view',
    'users.view',
    'categories.create',
    'products.create',
    'users.manage',
    'billing.view',
  ],
  MANAGER: [
    'dashboard.view',
    'categories.view',
    'products.view',
    'orders.view',
    'customers.view',
    'payments.view',
    'coupons.view',
    'reports.view',
    'settings.view',
    'users.view',
    'categories.create',
    'products.create',
  ],
  TENANT_STAFF: [
    'dashboard.view',
    'categories.view',
    'products.view',
    'orders.view',
  ],
  ATTENDANT: [
    'dashboard.view',
    'orders.view',
  ],
  OPERATOR: [
    'orders.view',
  ],
};

export function hasPermission(role: Role, permission: AppPermission): boolean {
  return PERMISSIONS_BY_ROLE[role]?.includes(permission) ?? false;
}

export function canAccessDashboard(role: Role): boolean {
  return hasPermission(role, 'dashboard.view');
}

export function canAccessEstablishments(role: Role): boolean {
  return hasPermission(role, 'establishments.view');
}

export function canAccessCategories(role: Role): boolean {
  return hasPermission(role, 'categories.view');
}

export function canAccessProducts(role: Role): boolean {
  return hasPermission(role, 'products.view');
}

export function canAccessOrders(role: Role): boolean {
  return hasPermission(role, 'orders.view');
}

export function canAccessCustomers(role: Role): boolean {
  return hasPermission(role, 'customers.view');
}

export function canAccessPayments(role: Role): boolean {
  return hasPermission(role, 'payments.view');
}

export function canAccessCoupons(role: Role): boolean {
  return hasPermission(role, 'coupons.view');
}

export function canAccessReports(role: Role): boolean {
  return hasPermission(role, 'reports.view');
}

export function canAccessSettings(role: Role): boolean {
  return hasPermission(role, 'settings.view');
}

export function canAccessUsers(role: Role): boolean {
  return hasPermission(role, 'users.view');
}

export function canCreateEstablishments(role: Role): boolean {
  return hasPermission(role, 'establishments.create');
}

export function canCreateCategories(role: Role): boolean {
  return hasPermission(role, 'categories.create');
}

export function canCreateProducts(role: Role): boolean {
  return hasPermission(role, 'products.create');
}

export function canManageUsers(role: Role): boolean {
  return hasPermission(role, 'users.manage');
}

export function canAccessPlatform(role: Role): boolean {
  return role === 'SUPER_ADMIN';
}

export function canAccessBilling(role: Role): boolean {
  return hasPermission(role, 'billing.view');
}

export function canAccessPath(role: Role, path: string): boolean {
  if (path === '/dashboard') return canAccessDashboard(role);
  if (path.startsWith('/establishments')) return canAccessEstablishments(role);
  if (path.startsWith('/categories')) return canAccessCategories(role);
  if (path.startsWith('/products')) return canAccessProducts(role);
  if (path.startsWith('/orders')) return canAccessOrders(role);
  if (path.startsWith('/customers')) return canAccessCustomers(role);
  if (path.startsWith('/payments')) return canAccessPayments(role);
  if (path.startsWith('/coupons')) return canAccessCoupons(role);
  if (path.startsWith('/reports')) return canAccessReports(role);
  if (path.startsWith('/settings')) return canAccessSettings(role);
  if (path.startsWith('/users')) return canAccessUsers(role);
  if (path.startsWith('/platform')) return canAccessPlatform(role);
  if (path.startsWith('/billing')) return canAccessBilling(role);
  return false;
}

export const MENU_ITEMS: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', permission: 'dashboard.view', check: canAccessDashboard },
  { path: '/platform/tenants', label: 'Plataforma', permission: 'platform.view', check: canAccessPlatform },
  {
    path: '/establishments',
    label: 'Estabelecimentos',
    permission: 'establishments.view',
    check: canAccessEstablishments,
  },
  { path: '/categories', label: 'Categorias', permission: 'categories.view', check: canAccessCategories },
  { path: '/products', label: 'Produtos', permission: 'products.view', check: canAccessProducts },
  { path: '/orders', label: 'Pedidos', permission: 'orders.view', check: canAccessOrders },
  { path: '/customers', label: 'Clientes', permission: 'customers.view', check: canAccessCustomers },
  { path: '/payments', label: 'Pagamentos', permission: 'payments.view', check: canAccessPayments },
  { path: '/coupons', label: 'Cupons', permission: 'coupons.view', check: canAccessCoupons },
  { path: '/reports', label: 'Relatórios', permission: 'reports.view', check: canAccessReports },
  { path: '/billing', label: 'Assinatura', permission: 'billing.view', check: canAccessBilling },
  { path: '/settings', label: 'Configurações', permission: 'settings.view', check: canAccessSettings },
  { path: '/users', label: 'Usuários', permission: 'users.view', check: canAccessUsers },
];