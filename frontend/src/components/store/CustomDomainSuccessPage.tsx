'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStoreDataByHost } from '@/hooks/useStoreData';
import { StoreHeader, StoreFooter, DomainNotFound } from '@/components/store';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/currency';

const linkBase = '';

export function CustomDomainSuccessPage({ host }: { host: string }) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderCode = searchParams.get('code');
  const orderTotal = searchParams.get('total');
  const { store, loading, error } = useStoreDataByHost(host);

  if (loading) return <LoadingPage />;
  if (error || !store) return <DomainNotFound host={host} description={error ?? undefined} />;

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader store={store} storeSlug={store.slug} linkBase={linkBase} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Pedido realizado!</h1>
          <p className="mt-2 text-gray-600">Seu pedido foi recebido e está sendo processado.</p>
          {orderCode && <p className="mt-2 text-lg font-semibold text-primary">Pedido #{orderCode}</p>}
          {orderTotal && (
            <p className="mt-1 text-gray-600">Total: {formatCurrency(parseFloat(orderTotal))}</p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {orderId && (
              <Link href={`/order/${orderId}`}>
                <Button>Acompanhar pedido</Button>
              </Link>
            )}
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
