import Link from 'next/link';
import type { ReactNode } from 'react';
import { ADMIN_URL } from '@/lib/constants';

export function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-950 antialiased">
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-base font-semibold tracking-tight text-black"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <span className="text-sm font-bold text-black">N</span>
            </span>
            <span className="text-[15px] sm:text-base">Nexora</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/#beneficios"
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-black"
            >
              Benefícios
            </Link>
            <Link
              href="/#preview"
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-black"
            >
              Demonstração
            </Link>
            <Link
              href="/planos"
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-black"
            >
              Planos
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`${ADMIN_URL}/login`}
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-black sm:inline-flex"
            >
              Entrar
            </a>
            <Link
              href="/comecar"
              className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(0,0,0,0.12)] transition hover:bg-gray-800"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}