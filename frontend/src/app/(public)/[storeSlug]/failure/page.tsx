'use client';

import Link from 'next/link';
import { useStoreData } from '@/hooks/useStoreData';
import { StoreHeader, StoreFooter } from '@/components/store';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';

interface PageProps {
  params: { storeSlug: string };
}

export default function FailurePage({ params }: PageProps) {
  const { storeSlug } = params;
  const { store, loading, error } = useStoreData(storeSlug);

  if (loading) return <LoadingPage />;
  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <p className="text-gray-600">Loja não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StoreHeader store={store} storeSlug={storeSlug} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white">
            <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Algo deu errado</h1>
          <p className="mt-2 text-gray-600">
            Não foi possível concluir seu pedido ou pagamento. Tente novamente.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/${storeSlug}/checkout`}>
              <Button className="rounded-xl bg-gray-900 hover:bg-gray-800">Tentar novamente</Button>
            </Link>
            <Link href={`/${storeSlug}`}>
              <Button variant="outline" className="rounded-xl border-gray-200">Voltar ao cardápio</Button>
            </Link>
          </div>
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
