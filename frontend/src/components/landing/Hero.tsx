import Link from 'next/link';
import { WHATSAPP_COMERCIAL_URL } from '@/lib/constants';

const METRICS = [
  { value: '10 min', label: 'para publicar seu cardápio' },
  { value: 'QR Code', label: 'gerado automaticamente' },
  { value: '24h', label: 'disponível no celular do cliente' },
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
            Cardápio digital profissional para restaurantes, lanchonetes, pizzarias e delivery
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl lg:text-6xl lg:leading-[1.02]">
            Seu restaurante com cardápio digital, QR Code e pedidos online em um só lugar.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
            Organize seus produtos, atualize preços em segundos e ofereça uma experiência mais
            profissional para o cliente sem depender de cardápio impresso ou aplicativo.
          </p>
          <p className="mt-3 text-base font-medium text-gray-700">
            Mais que cardápio digital: operação completa de salão.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/comecar"
              className="inline-flex min-h-[54px] items-center justify-center rounded-2xl bg-black px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition hover:bg-gray-800"
            >
              Testar grátis
            </Link>

            {WHATSAPP_COMERCIAL_URL ? (
              <a
                href={WHATSAPP_COMERCIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Falar no WhatsApp
              </a>
            ) : null}

            <Link
              href="/planos"
              className="inline-flex min-h-[54px] items-center justify-center rounded-2xl border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Ver planos e preços
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Sem complicação. Sem app para o cliente. Estrutura pronta para vender melhor no digital.
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
                  <p className="text-xs text-gray-500">Cardápio digital online</p>
                </div>
                <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-600">
                  QR ativo
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div className="rounded-[1.6rem] bg-black p-5 text-white shadow-sm">
                  <p className="text-sm text-white/70">Mais vendidos</p>
                  <p className="mt-1 text-xl font-semibold">Pratos principais</p>
                  <p className="mt-2 text-sm text-white/75">
                    Um visual mais profissional para apresentar melhor seu cardápio e gerar mais valor.
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
                          Descrição clara, preço atualizado e visual moderno no celular
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
                  <span>Sem instalar aplicativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}