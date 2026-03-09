'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStoreData } from '@/hooks/useStoreData';
import { StoreHeader, StoreFooter } from '@/components/store';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/currency';

interface PageProps {
  params: { storeSlug: string };
}

export default function SuccessPage({ params }: PageProps) {
  const { storeSlug } = params;
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderCode = searchParams.get('code');
  const orderTotal = searchParams.get('total');
  const { store, loading, error } = useStoreData(storeSlug);

  if (loading) return <LoadingPage />;
  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-gray-600">Loja nao encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader store={store} storeSlug={storeSlug} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Pedido realizado!</h1>
          <p className="mt-2 text-gray-600">
            Seu pedido foi recebido e esta sendo processado.
          </p>
          {orderCode && (
            <p className="mt-2 text-lg font-semibold text-primary">
              Pedido #{orderCode}
            </p>
          )}
          {orderTotal && (
            <p className="mt-1 text-gray-600">
              Total: {formatCurrency(parseFloat(orderTotal))}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {orderId && (
              <Link href={`/${storeSlug}/order/${orderId}`}>
                <Button>Acompanhar pedido</Button>
              </Link>
            )}
            <Link href={`/${storeSlug}`}>
              <Button variant="outline">Voltar ao cardapio</Button>
            </Link>
          </div>
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
