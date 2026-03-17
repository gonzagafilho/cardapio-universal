'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { Role } from '@/types/auth';

const TRIAL_EXPIRED_STORAGE_KEY = 'trialExpired';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* SIDEBAR MOBILE + DESKTOP */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <Sidebar userRole={user.role as Role} user={user} onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* CONTEÚDO */}
      <div className="min-h-screen lg:pl-72">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}