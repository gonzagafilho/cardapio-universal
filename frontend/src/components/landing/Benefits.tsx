const BENEFITS = [
  {
    index: '01',
    title: 'QR Code automático',
    description:
      'Gere o QR Code do cardápio direto no painel e disponibilize nas mesas, balcão ou embalagens.',
  },
  {
    index: '02',
    title: 'Atualização em segundos',
    description:
      'Altere preços, categorias, itens e disponibilidade sem depender de impressão ou retrabalho.',
  },
  {
    index: '03',
    title: 'Experiência profissional',
    description:
      'Layout responsivo, navegação clara e apresentação moderna para transmitir mais valor ao cliente.',
  },
];

export function Benefits() {
  return (
    <section
      id="beneficios"
      className="border-b border-gray-200 bg-gray-50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              Benefícios
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Mais agilidade para operar e mais valor para apresentar.
            </h2>
          </div>

          <p className="max-w-2xl text-lg leading-8 text-gray-600">
            A Nexora combina praticidade operacional com uma experiência visual moderna,
            para que seu cardápio seja fácil de manter e melhor de vender.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {BENEFITS.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-gray-200 bg-white p-7 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-400">{item.index}</span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                  Premium
                </span>
              </div>

              <h3 className="mt-8 text-xl font-semibold tracking-tight text-black">
                {item.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}