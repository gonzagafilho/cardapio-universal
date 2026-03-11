'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl">
      <div className="flex min-h-[72px] items-center justify-between px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Painel Nexora
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-black">
            Gestão comercial do seu cardápio digital
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-gray-200 bg-white px-4 py-2 text-right shadow-sm sm:block">
            <p className="text-sm font-semibold text-black">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>

          <Button variant="outline" size="sm" className="rounded-xl" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
