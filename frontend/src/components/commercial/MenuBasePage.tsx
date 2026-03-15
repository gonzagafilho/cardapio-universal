'use client';

import Link from 'next/link';
import { APP_URL, ADMIN_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';

/** Página premium exibida quando o visitante acessa o host base do menu (ex.: menu.cardapio.nexoracloud.com.br), sem subdomínio de loja. */
export function MenuBasePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">
          Cardápio Digital
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Cada estabelecimento tem seu próprio endereço para o cardápio. Use o link que você recebeu (ex.: <span className="font-mono text-gray-500">sua-loja.menu...</span>).
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Cliente do cardápio? Peça o link direto ao estabelecimento.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href={APP_URL}>
            <Button className="w-full rounded-xl bg-gray-900 hover:bg-gray-800">
              Ir para o site principal
            </Button>
          </Link>
          <Link href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full rounded-xl">
              Área do estabelecimento
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
