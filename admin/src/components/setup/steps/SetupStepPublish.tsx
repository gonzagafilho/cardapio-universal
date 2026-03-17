'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { APP_PUBLIC_URL } from '@/lib/constants';
import type { Establishment } from '@/types/establishment';

export function SetupStepPublish({
  establishment,
  onBack,
}: {
  establishment: Establishment;
  onBack: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const publicUrl = establishment.slug
    ? `${APP_PUBLIC_URL}/${establishment.slug}`
    : '';

  const copyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openCardapio = () => {
    if (publicUrl) window.open(publicUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Tudo pronto!</h2>
        <p className="mt-2 text-lg text-gray-600">
          Seu restaurante está pronto para começar a vender.
        </p>
      </div>

      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Link do seu cardápio</p>
        <p className="break-all font-mono text-sm font-medium text-gray-900" title={publicUrl || undefined}>
          {publicUrl || '—'}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button onClick={openCardapio} className="flex-1 sm:flex-none">
          Abrir cardápio
        </Button>
        <Button variant="outline" onClick={copyLink} className="flex-1 sm:flex-none">
          {copied ? 'Copiado!' : 'Copiar link'}
        </Button>
        <Button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-gray-900 text-white hover:bg-gray-800 sm:w-auto"
        >
          Ir para o painel
        </Button>
      </div>

      <div className="flex justify-between border-t border-gray-200 pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
