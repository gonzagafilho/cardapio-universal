import Link from 'next/link';
import Image from 'next/image';
import { WHATSAPP_COMERCIAL_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { CommercialLayout } from '@/components/commercial/CommercialLayout';
import { COMMERCIAL_PLANS, PRICE_EXTRA_RESTAURANT, TRIAL_MESSAGE } from '@/lib/plans-commercial';
import { FileText, QrCode, ShoppingBag, LayoutGrid, ClipboardList, ChefHat, CreditCard } from 'lucide-react';

export default function PlanosPage() {
  return (
    <CommercialLayout>
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="mx-auto w-full max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                <span className="inline-flex h-2 w-2 rounded-full bg-black" />
                Planos Nexora
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-black sm:text-5xl lg:text-6xl">
                Crie seu cardápio digital em minutos e aumente seus pedidos hoje mesmo.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl lg:mx-0">
                Sem aplicativo, sem complicação. Gere QR Code, receba pedidos e tenha um sistema
                profissional para seu restaurante.
              </p>

              <ul className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium text-gray-700 sm:flex-nowrap sm:justify-center lg:mx-0 lg:justify-start">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600" aria-hidden>
                    ✔
                  </span>
                  Comece em menos de 5 minutos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600" aria-hidden>
                    ✔
                  </span>
                  Sem mensalidade escondida
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600" aria-hidden>
                    ✔
                  </span>
                  Teste grátis por 7 dias
                </li>
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
              {/* Fundo tecnológico leve */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-gray-50 via-white to-gray-50/80 opacity-90" aria-hidden />
              <div className="absolute -inset-4 rounded-3xl bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" aria-hidden />

              {/* Mini-cards flutuantes */}
              <div className="absolute -left-2 top-[12%] z-10 rounded-xl border border-gray-200/90 bg-white px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)] sm:-left-3 sm:px-4 sm:py-2.5">
                <p className="text-xs font-semibold text-black sm:text-sm">Mesa 12</p>
                <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">2 itens · R$ 48</p>
              </div>
              <div className="absolute -right-2 top-[28%] z-10 rounded-xl border border-gray-200/90 bg-white px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)] sm:-right-3 sm:px-4 sm:py-2.5">
                <div className="flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                  <p className="text-xs font-semibold text-black sm:text-sm">QR ativo</p>
                </div>
                <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">Cardápio online</p>
              </div>
              <div className="absolute bottom-[18%] -left-2 z-10 rounded-xl border border-gray-200/90 bg-white px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)] sm:-left-3 sm:px-4 sm:py-2.5">
                <div className="flex items-center gap-1.5">
                  <ChefHat className="h-3.5 w-3.5 text-amber-600" />
                  <p className="text-xs font-semibold text-black sm:text-sm">Cozinha</p>
                </div>
                <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">Pedido #42 enviado</p>
              </div>
              <div className="absolute bottom-[18%] -right-2 z-10 rounded-xl border border-gray-200/90 bg-white px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)] sm:-right-3 sm:px-4 sm:py-2.5">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-black" />
                  <p className="text-xs font-semibold text-black sm:text-sm">Pagamento</p>
                </div>
                <p className="mt-0.5 text-[10px] text-emerald-600 sm:text-xs">Confirmado</p>
              </div>

              {/* Card principal: dashboard Nexora */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200/95 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.12)] transition duration-300 hover:shadow-[0_28px_80px_rgba(0,0,0,0.14)]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,0,0,0.04),transparent)]" aria-hidden />
                {/* Header do painel */}
                <div className="relative flex items-center justify-between border-b border-gray-100 bg-gray-50/90 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-bold text-white shadow-sm">
                      N
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-black">Nexora</p>
                      <p className="text-[10px] text-gray-500">Painel · Operação</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700">
                    Online
                  </span>
                </div>
                {/* Grid do dashboard */}
                <div className="relative grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 transition duration-200 hover:border-gray-300 hover:bg-gray-50 sm:p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white">
                        <LayoutGrid className="h-4 w-4 text-gray-700" />
                      </span>
                      <span className="text-xs font-semibold text-black sm:text-sm">Cardápio</span>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500 sm:text-xs">Produtos e categorias</p>
                    <div className="mt-2 flex gap-1">
                      <span className="h-1.5 flex-1 rounded-full bg-gray-200" />
                      <span className="h-1.5 flex-1 rounded-full bg-gray-200" />
                      <span className="h-1.5 w-4 rounded-full bg-gray-300" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 transition duration-200 hover:border-gray-300 hover:bg-gray-50 sm:p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white">
                        <ClipboardList className="h-4 w-4 text-gray-700" />
                      </span>
                      <span className="text-xs font-semibold text-black sm:text-sm">Pedidos</span>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500 sm:text-xs">Em andamento</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-600">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      #41 · #42 · #43
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 transition duration-200 hover:border-gray-300 hover:bg-gray-50 sm:p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white">
                        <QrCode className="h-4 w-4 text-gray-700" />
                      </span>
                      <span className="text-xs font-semibold text-black sm:text-sm">QR Code</span>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500 sm:text-xs">Link do cardápio</p>
                    <div className="mt-2 h-10 w-10 rounded border-2 border-dashed border-gray-300 bg-white" aria-hidden />
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 transition duration-200 hover:border-gray-300 hover:bg-gray-50 sm:p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white">
                        <ChefHat className="h-4 w-4 text-gray-700" />
                      </span>
                      <span className="text-xs font-semibold text-black sm:text-sm">Cozinha</span>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500 sm:text-xs">Preparação</p>
                    <div className="mt-2 flex gap-1">
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">2</span>
                      <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600">Prontos</span>
                    </div>
                  </div>
                </div>
                <div className="relative border-t border-gray-100 bg-gray-50/50 px-4 py-2 text-center">
                  <p className="text-[10px] font-medium text-gray-500">Nexora · Cardápio digital para restaurantes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 nx-fade-up nx-delay-1">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                Veja como funciona
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Veja como funciona na prática
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Uma experiência clara para o cliente e um painel simples para você atualizar tudo.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Cardápio', caption: 'Organizado, bonito e rápido' },
                { title: 'Tela de pedido', caption: 'Fluxo direto e sem fricção' },
                { title: 'QR Code', caption: 'Pronto para imprimir e usar' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.10)]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
                    <Image
                      src="/mockup.png"
                      alt={`Prévia: ${item.title}`}
                      width={1200}
                      height={900}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-base font-semibold text-black">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 nx-fade-up nx-delay-2">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                Como funciona
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Simples, rápido e direto ao ponto
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Crie seu cardápio',
                  text: 'Cadastre produtos e categorias e publique em poucos minutos.',
                  Icon: FileText,
                },
                {
                  step: '2',
                  title: 'Compartilhe o link ou QR Code',
                  text: 'Coloque nas mesas, balcão, delivery e no WhatsApp.',
                  Icon: QrCode,
                },
                {
                  step: '3',
                  title: 'Receba pedidos automaticamente',
                  text: 'Centralize sua operação e acompanhe tudo no painel.',
                  Icon: ShoppingBag,
                },
              ].map(({ step, title, text, Icon }) => (
                <div
                  key={step}
                  className="rounded-[2rem] border border-gray-200 bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-4xl font-semibold tracking-tight text-black/20">
                      {step}
                    </span>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-900">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-8 text-xl font-semibold tracking-tight text-black">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 nx-fade-up nx-delay-3">
            <div className="rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:px-10">
              <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                Pronto para usar sem complicação
              </h2>
              <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
                {[
                  'Funciona em qualquer celular',
                  'Sem precisar instalar aplicativo',
                  'Pronto em poucos minutos',
                ].map((text) => (
                  <div
                    key={text}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800"
                  >
                    <span className="text-emerald-600" aria-hidden>
                      ✔
                    </span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prova social */}
          <div className="mt-14 rounded-[2rem] border border-gray-200/90 bg-white px-6 py-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:px-10">
            <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              Confiança
            </p>
            <h2 className="mt-3 text-center text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Feito para quem quer vender mais
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-gray-600">
              Restaurantes e lanchonetes em todo o Brasil já usam a Nexora para cardápio digital, QR Code e pedidos. Sem app para o cliente e com suporte em português.
            </p>
            <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-6 text-center transition duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <p className="text-xl font-semibold tracking-tight text-black">Qualquer celular</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">Seu cliente só abre o link. Não precisa baixar nada.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-6 text-center transition duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <p className="text-xl font-semibold tracking-tight text-black">Minutos para publicar</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">Cardápio no ar em pouco tempo, com visual profissional.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-6 text-center transition duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <p className="text-xl font-semibold tracking-tight text-black">Suporte humano</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">Dúvidas? Nossa equipe atende por WhatsApp.</p>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {COMMERCIAL_PLANS.map((plan) => (
              <div
                key={plan.key}
                className={[
                  'relative flex h-full flex-col rounded-[2rem] border p-7 transition duration-300',
                  plan.recommended
                    ? 'border-black bg-black text-white shadow-[0_24px_70px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_30px_90px_rgba(0,0,0,0.18)]'
                    : 'border-gray-200 bg-white text-black shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]',
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
                      {plan.restaurantCount === 1
                        ? 'Perfeito para quem está começando'
                        : plan.restaurantCount === 2
                          ? 'Ideal para quem quer crescer e vender mais'
                          : 'Para negócios com múltiplas unidades'}
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
                    Inclui {plan.restaurantCount} restaurante{plan.restaurantCount > 1 ? 's' : ''}. Preço mensal.
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
                  <Link href="/comecar" className="block">
                    <Button
                      size="lg"
                      className={`w-full rounded-2xl font-semibold ${
                        plan.recommended
                          ? 'bg-white text-black hover:bg-gray-100'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                      variant="primary"
                    >
                      Começar teste grátis
                    </Button>
                  </Link>

                  <p
                    className={`text-center text-xs ${
                      plan.recommended ? 'text-white/60' : 'text-gray-500'
                    }`}
                  >
                    {TRIAL_MESSAGE}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Upsell: Nexora Salão — QR por mesa */}
          <div className="mt-14 rounded-[2rem] border border-gray-200/90 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] ring-1 ring-gray-100/80 sm:ring-0">
            <div className="flex flex-col gap-8 p-7 sm:p-10 lg:flex-row lg:items-stretch lg:gap-10">
              <div className="flex-1 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-gray-50/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500">
                  Módulo adicional
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  Nexora Salão — QR por mesa para atendimento presencial
                </h2>
                <p className="mt-3 text-base leading-relaxed text-gray-600 sm:text-lg">
                  Ideal para restaurantes, bares e operações com consumo no local. Gere um QR Code por mesa, identifique automaticamente o pedido e organize melhor o atendimento presencial.
                </p>

                <ul className="mt-6 space-y-2.5 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:space-y-0">
                  {[
                    '1 QR Code para cada mesa',
                    'Identificação automática da mesa no pedido',
                    'Pedido organizado para operação do restaurante',
                    'Ideal para salão, bar, café e consumo local',
                  ].map((text) => (
                    <li
                      key={text}
                      className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 py-3 pl-3 pr-4 text-sm font-medium text-gray-800"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200/80">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="leading-snug">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full shrink-0 lg:w-[280px]">
                <div className="rounded-[1.75rem] border border-gray-200/90 bg-gray-50/50 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
                  <p className="text-sm font-semibold text-gray-900">
                    A partir de <span className="font-extrabold text-black">+ R$ 79/mês</span> por restaurante
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">
                    Módulo premium vendido separadamente. Ideal para atendimento em mesa.
                  </p>

                  <div className="mt-6 space-y-3">
                    <Link href="/comecar" className="block">
                      <Button size="lg" className="w-full rounded-2xl bg-black text-white hover:bg-gray-800">
                        Quero esse módulo
                      </Button>
                    </Link>

                    <a
                      href="https://wa.me/5561996088711"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button size="lg" variant="outline" className="w-full rounded-2xl">
                        Falar com especialista
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-base font-medium text-gray-700">
            + Adicione mais restaurantes por apenas R$ 119/mês cada
          </p>

          <div className="mt-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-6 py-5 text-center">
            <p className="text-base font-semibold text-emerald-900">{PRICE_EXTRA_RESTAURANT}</p>
            <p className="mt-1 text-sm text-emerald-800/90">{TRIAL_MESSAGE}</p>
          </div>

          {/* FAQ comercial */}
          <div className="mt-14 rounded-[2rem] border border-gray-200/90 bg-white px-6 py-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:px-10">
            <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              Dúvidas frequentes
            </p>
            <h2 className="mt-3 text-center text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Perguntas que nossos clientes fazem
            </h2>
            <dl className="mx-auto mt-8 max-w-2xl space-y-3">
              {[
                {
                  q: 'Precisa baixar app?',
                  a: 'Não. Seu cliente acessa o cardápio por link ou QR Code direto no navegador do celular, sem instalar nada.',
                },
                {
                  q: 'Funciona em qualquer celular?',
                  a: 'Sim. Qualquer smartphone com navegador (Chrome, Safari, etc.) abre o cardápio normalmente.',
                },
                {
                  q: 'Posso testar grátis?',
                  a: 'Sim. Você tem 7 dias grátis para usar tudo. Depois escolhe o plano pelo número de restaurantes (1, 2 ou 3).',
                },
                {
                  q: 'Como funciona para mais de um restaurante?',
                  a: 'Os planos são por quantidade: 1 restaurante (R$ 159/mês), 2 (R$ 278/mês), 3 (R$ 397/mês). Acima disso, cada adicional sai por R$ 119/mês. Tudo no mesmo painel.',
                },
                {
                  q: 'Consigo receber pedidos online?',
                  a: 'Sim. O cliente faz o pedido pelo cardápio no celular e você acompanha tudo no painel, com organização por status e histórico.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-4 transition duration-200 hover:border-gray-300 hover:bg-gray-50">
                  <dt className="text-base font-semibold text-black">{q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-gray-600">{a}</dd>
                </div>
              ))}
            </dl>
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
              <Link href="/comecar">
                <Button size="lg" className="rounded-2xl bg-black px-8 text-white hover:bg-gray-800">
                  Começar teste grátis
                </Button>
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

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Voltar para o site
              </Link>
            </div>
          </div>
        </div>
      </section>
    </CommercialLayout>
  );
}
