'use client';

import Link from 'next/link';
import { APP_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export interface DomainNotFoundProps {
  /** Host que não foi encontrado (ex.: subdomínio ou domínio custom). */
  host?: string;
  /** Mensagem curta (ex.: "Este domínio não está configurado"). */
  title?: string;
  /** Descrição opcional. */
  description?: string;
}

export function DomainNotFound({
  host,
  title = 'Domínio não encontrado',
  description = 'Este endereço não está vinculado a nenhum cardápio. Verifique o link ou acesse o site principal.',
}: DomainNotFoundProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9a9 9 0 009 9m-9 9a9 9 0 009-9m9 9H3" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
        {host && (
          <p className="mt-2 text-sm text-gray-500">
            <span className="font-mono">{host}</span>
          </p>
        )}
        <div className="mt-8">
          <Link href={APP_URL}>
            <Button className="rounded-xl bg-gray-900 hover:bg-gray-800">
              Ir para o site principal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
