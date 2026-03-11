import Link from 'next/link';
import { ADMIN_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { CommercialLayout } from '@/components/commercial/CommercialLayout';
import { COMMERCIAL_PLANS } from '@/lib/plans-commercial';

export default function PlanosPage() {
  return (
    <CommercialLayout>
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
              <span className="inline-flex h-2 w-2 rounded-full bg-black" />
              Planos Nexora
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-black sm:text-5xl lg:text-6xl">
              Escolha o plano ideal para vender mais com um cardápio digital profissional.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
              Estruture seu cardápio, gere QR Code automaticamente e apresente sua marca
              com um visual mais moderno, rápido e comercial.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {COMMERCIAL_PLANS.map((plan) => (
              <div
                key={plan.key}
                className={[
                  'relative flex h-full flex-col rounded-[2rem] border p-7 transition',
                  plan.recommended
                    ? 'border-black bg-black text-white shadow-[0_24px_70px_rgba(0,0,0,0.14)]'
                    : 'border-gray-200 bg-white text-black shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]',
                ].join(' ')}
              >
                {plan.recommended ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-semibold text-black shadow-sm">
                    Mais escolhido
                  </span>
                ) : null}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className={`text-2xl font-semibold tracking-tight ${
                        plan.recommended ? 'text-white' : 'text-black'
                      }`}
                    >
                      {plan.name}
                    </h2>
                    <p
                      className={`mt-2 text-sm ${
                        plan.recommended ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {plan.recommended
                        ? 'A melhor escolha para quem quer presença forte, aparência profissional e mais conversão.'
                        : 'Estrutura profissional para publicar, organizar e vender melhor no digital.'}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <p
                    className={`text-4xl font-semibold tracking-tight ${
                      plan.recommended ? 'text-white' : 'text-black'
                    }`}
                  >
                    {plan.price}
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      plan.recommended ? 'text-white/65' : 'text-gray-500'
                    }`}
                  >
                    Cadastro rápido. Publicação simples. Experiência mais premium para o cliente.
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                        plan.recommended
                          ? 'border-white/10 bg-white/5 text-white/90'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.recommended
                            ? 'bg-white text-black'
                            : 'bg-white text-gray-900 ring-1 ring-gray-200'
                        }`}
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <Link href={`${ADMIN_URL}/onboarding`} className="block">
                    <Button
                      size="lg"
                      className={`w-full rounded-2xl font-semibold ${
                        plan.recommended
                          ? 'bg-white text-black hover:bg-gray-100'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                      variant="primary"
                    >
                      Começar agora
                    </Button>
                  </Link>

                  <p
                    className={`text-center text-xs ${
                      plan.recommended ? 'text-white/60' : 'text-gray-500'
                    }`}
                  >
                    Sem complicação. Pronto para publicar e vender.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-[2rem] border border-gray-200 bg-gray-50 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Quer colocar seu cardápio no ar ainda hoje?
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Crie sua conta, configure sua loja e publique uma experiência mais profissional
              para seu cliente em poucos minutos.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={`${ADMIN_URL}/onboarding`}>
                <Button size="lg" className="rounded-2xl bg-black px-8 text-white hover:bg-gray-800">
                  Criar conta grátis
                </Button>
              </Link>

              <a
                href={`${ADMIN_URL}/login`}
                className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Já tenho conta
              </a>
            </div>
          </div>
        </div>
      </section>
    </CommercialLayout>
  );
}
