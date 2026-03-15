'use client';

import Link from 'next/link';
import { useStoreData } from '@/hooks/useStoreData';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

interface PageProps {
  params: { storeSlug: string };
}

export default function InstalarPage({ params }: PageProps) {
  const { storeSlug } = params;
  const { store, loading, error } = useStoreData(storeSlug);

  if (loading) return <LoadingPage />;
  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <EmptyState
          title="Loja não encontrada"
          description={error ?? 'Verifique o link e tente novamente.'}
        />
      </div>
    );
  }

  const storeName = store.name ?? 'Cardápio';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Instalar app do cardápio
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Instale o cardápio <strong>{storeName}</strong> na tela inicial para acessar mais rápido e fazer pedidos com praticidade.
          </p>

          <div className="mt-6 space-y-4 text-sm text-gray-700">
            <section>
              <h2 className="font-medium text-gray-900">No Android</h2>
              <p className="mt-1">
                Use o botão &quot;Instalar&quot; abaixo (quando aparecer) ou abra o menu <strong>⋮</strong> do navegador e escolha &quot;Adicionar à tela inicial&quot; ou &quot;Instalar app&quot;.
              </p>
            </section>
            <section>
              <h2 className="font-medium text-gray-900">No iPhone</h2>
              <p className="mt-1">
                Toque em <strong>Compartilhar</strong> na barra do Safari, depois em <strong>Adicionar à Tela de Início</strong> e confirme em <strong>Adicionar</strong>.
              </p>
            </section>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={`/${storeSlug}`}
              className="rounded-lg bg-gray-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
            >
              Abrir cardápio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
