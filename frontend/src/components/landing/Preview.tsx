export function Preview() {
  return (
    <section
      id="preview"
      className="border-b border-gray-200 bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            Demonstração
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Um cardápio digital bonito, rápido e pensado para conversão.
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            O cliente escaneia o QR Code, abre o cardápio no navegador e encontra produtos,
            categorias e preços com clareza, rapidez e aparência profissional.
          </p>

          <div className="mt-8 space-y-4">
            {[
              'Visual organizado para o cliente encontrar mais rápido o que quer pedir',
              'Categorias e produtos atualizados em tempo real sem retrabalho',
              'Estrutura ideal para mesas, balcão, delivery e divulgação no WhatsApp',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4"
              >
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-black" />
                <p className="text-sm leading-7 text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[560px] rounded-[2rem] border border-gray-200 bg-white p-3 shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
            <div className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-gray-50">
              <div className="border-b border-gray-200 bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-black">
                      Restaurante Modelo
                    </p>
                    <p className="text-sm text-gray-500">
                      Cardápio digital em tempo real
                    </p>
                  </div>
                  <div className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                    Online
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                    Entradas
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-gray-200 p-3">
                      <p className="text-sm font-semibold text-black">
                        Bruschetta especial
                      </p>
                      <p className="mt-1 text-xs text-gray-500">R$ 18,90</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 p-3">
                      <p className="text-sm font-semibold text-black">
                        Carpaccio
                      </p>
                      <p className="mt-1 text-xs text-gray-500">R$ 29,90</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-black p-4 text-white">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                    Pratos principais
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-sm font-semibold">Salmão grelhado</p>
                      <p className="mt-1 text-xs text-white/70">R$ 64,90</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-sm font-semibold">Parmegiana premium</p>
                      <p className="mt-1 text-xs text-white/70">R$ 52,90</p>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 rounded-3xl border border-dashed border-gray-300 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-black">
                        QR Code na mesa
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        O cliente acessa sem instalar aplicativo e faz o pedido com mais praticidade
                      </p>
                    </div>
                    <div className="grid h-16 w-16 grid-cols-4 gap-1 rounded-xl border border-gray-200 bg-gray-50 p-2">
                      {Array.from({ length: 16 }).map((_, index) => (
                        <span
                          key={index}
                          className={index % 3 === 0 ? 'rounded-sm bg-black' : 'rounded-sm bg-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}