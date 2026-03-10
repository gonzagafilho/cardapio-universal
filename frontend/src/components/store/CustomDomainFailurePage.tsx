'use client';

import Link from 'next/link';
import { useStoreDataByHost } from '@/hooks/useStoreData';
import { StoreHeader, StoreFooter } from '@/components/store';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';

const linkBase = '';

export function CustomDomainFailurePage({ host }: { host: string }) {
  const { store, loading, error } = useStoreDataByHost(host);

  if (loading) return <LoadingPage />;
  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-gray-600">Loja não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader store={store} storeSlug={store.slug} linkBase={linkBase} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Algo deu errado</h1>
          <p className="mt-2 text-gray-600">
            Não foi possível concluir seu pedido ou pagamento. Tente novamente.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/checkout">
              <Button>Tentar novamente</Button>
            </Link>
            <Link href={linkBase || '/'}>
              <Button variant="outline">Voltar ao cardápio</Button>
            </Link>
          </div>
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
