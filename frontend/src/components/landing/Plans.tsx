import Link from 'next/link';
import { WHATSAPP_COMERCIAL_URL } from '@/lib/constants';

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

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/comecar"
            className="inline-flex items-center justify-center rounded-2xl bg-black px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            Testar grátis
          </Link>
          {WHATSAPP_COMERCIAL_URL ? (
            <a
              href={WHATSAPP_COMERCIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-[#25D366] px-8 py-3.5 text-base font-semibold text-white transition hover:bg-[#20bd5a]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Falar no WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}