import Link from 'next/link';
import { ADMIN_URL } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-bold">
                N
              </span>
              <span className="text-lg font-semibold tracking-tight">Nexora</span>
            </div>

            <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white">
              Cardápio digital com padrão visual profissional.
            </h3>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Plataforma SaaS para negócios que querem apresentar melhor seus produtos,
              atualizar o cardápio com rapidez e operar com mais praticidade no digital.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-white">Produto</p>
              <nav className="mt-4 flex flex-col gap-3 text-sm">
                <Link href="/#beneficios" className="text-gray-400 transition hover:text-white">
                  Benefícios
                </Link>
                <Link href="/#preview" className="text-gray-400 transition hover:text-white">
                  Demonstração
                </Link>
                <Link href="/planos" className="text-gray-400 transition hover:text-white">
                  Planos
                </Link>
              </nav>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Acesso</p>
              <nav className="mt-4 flex flex-col gap-3 text-sm">
                <a
                  href={`${ADMIN_URL}/onboarding`}
                  className="text-gray-400 transition hover:text-white"
                >
                  Criar conta
                </a>
                <a
                  href={`${ADMIN_URL}/login`}
                  className="text-gray-400 transition hover:text-white"
                >
                  Entrar
                </a>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-sm text-gray-500">© 2026 Nexora — Cardápio Digital SaaS</p>
        </div>
      </div>
    </footer>
  );
}