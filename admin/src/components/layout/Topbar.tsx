'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          {user?.name} <span className="text-gray-400">({user?.role})</span>
        </span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>
    </header>
  );
}
