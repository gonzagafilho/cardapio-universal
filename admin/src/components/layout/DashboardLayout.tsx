'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { Role } from '@/types/auth';

const TRIAL_EXPIRED_STORAGE_KEY = 'trialExpired';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handler = () => {
      if (typeof window === 'undefined') return;
      if (pathname === '/billing') return;
      if (user?.role === 'SUPER_ADMIN') return;
      window.sessionStorage.setItem(TRIAL_EXPIRED_STORAGE_KEY, '1');
      router.replace('/billing');
    };
    window.addEventListener('trialExpired', handler);
    return () => window.removeEventListener('trialExpired', handler);
  }, [pathname, user?.role, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar userRole={user.role as Role} />
      <div className="pl-64">
        <Topbar />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
