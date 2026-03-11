import Link from 'next/link';
import { ADMIN_URL } from '@/lib/constants';

const PLANS = [
  {
    name: 'Starter',
    audience: 'Para operações menores',
    description: 'Ideal para quem quer sair do PDF e começar com um cardápio digital profissional.',
    highlights: ['Cardápio online', 'QR Code automático', 'Atualização rápida'],
    featured: false,
  },
  {
    name: 'Pro',
    audience: 'Para crescer com mais presença',
    description: 'A opção mais equilibrada para negócios que querem vender melhor e transmitir mais valor.',
    highlights: ['Visual profissional', 'Operação mais robusta', 'Melhor percepção de marca'],
    featured: true,
  },
  {
    name: 'Enterprise',
    audience: 'Para redes e operação maior',
    description: 'Pensado para estruturas com maior volume, mais controle e necessidade de escala.',
    highlights: ['Estrutura escalável', 'Mais consistência operacional', 'Pronto para expansão'],
    featured: false,
  },
];

export function Plans() {
  return (
    <section
      id="planos"
      className="border-b border-gray-200 bg-gray-50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            Planos
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Escolha a estrutura ideal para o momento do seu negócio.
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Comece rápido, evolua com segurança e apresente seu cardápio com um
            padrão profissional.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={[
                'rounded-3xl border p-7 shadow-sm transition',
                plan.featured
                  ? 'border-black bg-black text-white shadow-[0_18px_60px_rgba(0,0,0,0.12)]'
                  : 'border-gray-200 bg-white text-black hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className={`text-2xl font-semibold tracking-tight ${
                    plan.featured ? 'text-white' : 'text-black'
                  }`}
                >
                  {plan.name}
                </p>

                {plan.featured ? (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                    Mais escolhido
                  </span>
                ) : null}
              </div>

              <p
                className={`mt-3 text-sm ${
                  plan.featured ? 'text-white/70' : 'text-gray-500'
                }`}
              >
                {plan.audience}
              </p>

              <p
                className={`mt-6 text-sm leading-7 ${
                  plan.featured ? 'text-white/80' : 'text-gray-600'
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-8 space-y-3">
                {plan.highlights.map((item) => (
                  <div
                    key={item}
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      plan.featured
                        ? 'border-white/15 bg-white/5 text-white/90'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <Link
                href="/planos"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                }`}
              >
                Ver detalhes
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href={`${ADMIN_URL}/onboarding`}
            className="inline-flex items-center justify-center rounded-2xl bg-black px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            Começar grátis
          </a>
        </div>
      </div>
    </section>
  );
}