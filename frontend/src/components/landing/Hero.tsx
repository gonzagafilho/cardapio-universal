import Link from 'next/link';
import { ADMIN_URL } from '@/lib/constants';

const METRICS = [
  { value: '10 min', label: 'para publicar seu cardápio' },
  { value: 'QR Code', label: 'gerado automaticamente' },
  { value: '100%', label: 'responsivo em qualquer celular' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_34%)]" />
      <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gray-100/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-black" />
            Cardápio Digital SaaS para restaurantes, bares e lanchonetes
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl lg:text-6xl lg:leading-[1.02]">
            Venda melhor com um cardápio digital bonito, rápido e fácil de atualizar.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
            Organize seu menu em uma plataforma profissional, gere QR Code automaticamente
            e atualize preços, categorias e itens sem depender de arte impressa.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={`${ADMIN_URL}/onboarding`}
              className="inline-flex min-h-[54px] items-center justify-center rounded-2xl bg-black px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition hover:bg-gray-800"
            >
              Criar Cardápio Grátis
            </a>

            <Link
              href="/#preview"
              className="inline-flex min-h-[54px] items-center justify-center rounded-2xl border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Ver demonstração
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Sem aplicativo para o cliente. Sem complicação. Pronto para operação real.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {METRICS.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
              >
                <p className="text-2xl font-semibold tracking-tight text-black">
                  {item.value}
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[470px] rounded-[2.2rem] border border-gray-200 bg-white p-3 shadow-[0_30px_90px_rgba(0,0,0,0.10)]">
            <div className="overflow-hidden rounded-[1.7rem] border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-black">Bistrô Nexora</p>
                  <p className="text-xs text-gray-500">Cardápio digital</p>
                </div>
                <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-600">
                  QR ativo
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div className="rounded-[1.6rem] bg-black p-5 text-white shadow-sm">
                  <p className="text-sm text-white/70">Categoria em destaque</p>
                  <p className="mt-1 text-xl font-semibold">Pratos principais</p>
                  <p className="mt-2 text-sm text-white/75">
                    Um visual limpo para apresentar melhor seus itens e transmitir mais valor.
                  </p>
                </div>

                {[
                  { name: 'Risoto de Camarão', price: 'R$ 58,90' },
                  { name: 'Filé ao Molho Madeira', price: 'R$ 49,90' },
                  { name: 'Lasanha Artesanal', price: 'R$ 36,90' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="rounded-[1.4rem] border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-black">{item.name}</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Foto, descrição curta e preço atualizado em segundos
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-black">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 bg-white px-5 py-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Funciona em qualquer celular</span>
                  <span>Sem instalar app</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}