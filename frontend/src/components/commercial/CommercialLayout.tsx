import Link from 'next/link';
import { ADMIN_URL } from '@/lib/constants';
import { ChatWidget } from './ChatWidget';

export function CommercialLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar fixa */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-gray-900 transition-opacity hover:opacity-90"
          >
            Nexora
          </Link>
          <nav className="flex items-center gap-1 sm:gap-6">
            <Link
              href="/planos"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Planos
            </Link>
            <a
              href="/#beneficios"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 sm:block"
            >
              Benefícios
            </a>
            <a
              href={`${ADMIN_URL}/login`}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 sm:block"
            >
              Entrar
            </a>
            <Link
              href="/comecar"
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <ChatWidget />

      {/* Footer profissional */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">Nexora</p>
              <p className="mt-2 text-sm text-gray-500">
                Cardápio digital profissional para restaurantes e delivery.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Produto</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/planos" className="text-sm text-gray-500 hover:text-gray-900">
                    Planos
                  </Link>
                </li>
                <li>
                  <Link href="/comecar" className="text-sm text-gray-500 hover:text-gray-900">
                    Começar grátis
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Conta</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href={`${ADMIN_URL}/login`} className="text-sm text-gray-500 hover:text-gray-900">
                    Entrar
                  </a>
                </li>
                <li>
                  <Link href="/comecar" className="text-sm text-gray-500 hover:text-gray-900">
                    Criar conta
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-100 pt-8">
            <p className="text-center text-xs text-gray-400">
              © {year} Nexora. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
