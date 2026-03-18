'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { MENU_ITEMS } from '@/lib/permissions';
import type { Role } from '@/types/auth';
import type { UserSession } from '@/types/auth';

const icons: Record<string, string> = {
  dashboard: '🏠',
  establishments: '🏬',
  'establishments-id': '🔗',
  categories: '🏷️',
  products: '📦',
  orders: '📋',
  salon: '🧑‍🍳',
  tables: '🪑',
  cozinha: '🍳',
  customers: '👥',
  payments: '💳',
  coupons: '🎟️',
  reports: '📊',
  settings: '⚙️',
  users: '👤',
  billing: '💰',
  platform: '🖥️',
};

type SidebarProps = {
  userRole: Role;
  user?: UserSession | null;
  onNavigate?: () => void;
};

export function Sidebar({ userRole, user, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const isPlatformAdmin = userRole === 'SUPER_ADMIN';

  let visible = MENU_ITEMS.filter((item) => item.check(userRole));

  if (!isPlatformAdmin) {
    visible = [...visible].sort(
      (a, b) => (a.orderRestaurant ?? 50) - (b.orderRestaurant ?? 50),
    );
  }

  const itemsWithLabel = visible.map((item) => ({
    ...item,
    label: isPlatformAdmin ? item.label : (item.labelRestaurant ?? item.label),
    path: item.path,
  }));

  const withMeuLink: Array<{ path: string; label: string; key: string }> = [];
  for (const item of itemsWithLabel) {
    withMeuLink.push({ path: item.path, label: item.label, key: item.path });
    if (item.path === '/establishments' && user?.establishmentId) {
      withMeuLink.push({
        path: `/establishments/${user.establishmentId}`,
        label: 'Meu link',
        key: '/establishments/meu-link',
      });
    }
  }

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-gray-200 bg-white shadow-xl lg:shadow-none">
      {/* LOGO / IDENTIDADE: plataforma para SUPER_ADMIN, painel neutro para restaurante */}
      <div className={`border-b px-3 py-3 ${isPlatformAdmin ? 'border-slate-800 bg-slate-950' : 'border-gray-200 bg-white'}`}>
        <div className={`flex h-14 items-center justify-center rounded-2xl shadow-md ${isPlatformAdmin ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-black' : 'border border-gray-200 bg-gray-50'}`}>
          {isPlatformAdmin ? (
            <img
              src="/platform-logo.png"
              alt="NexoraCloud"
              className="w-full max-w-[220px] px-2 object-contain"
            />
          ) : (
            <span className="text-lg font-semibold tracking-tight text-gray-800">Painel</span>
          )}
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-3">
        {withMeuLink.map((item) => {
          const segment = item.path.split('/')[1] ?? 'dashboard';
          const iconKey = item.path.startsWith('/establishments/') && item.path !== '/establishments' ? 'establishments-id' : segment;

          const isActive =
            pathname === item.path ||
            (item.path !== '/establishments' && pathname.startsWith(item.path + '/'));

          return (
            <Link
              key={item.key}
              href={item.path}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition',
                  isActive
                    ? 'border-sky-200 bg-sky-100'
                    : 'border-gray-200 bg-gray-50'
                )}
              >
                {icons[iconKey] ?? '🏠'}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}