'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

type AccessDeniedProps = {
  title?: string;
  description?: string;
};

export function AccessDenied({
  title = 'Acesso negado',
  description = 'Você não tem permissão para acessar esta área.',
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{description}</p>

        <div className="mt-6 flex justify-center">
          <Link href="/dashboard">
            <Button>Voltar ao dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}