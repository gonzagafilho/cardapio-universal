const BENEFITS = [
  {
    index: '01',
    title: 'Pare de depender de cardápio impresso',
    description:
      'Atualize preços, produtos e categorias em segundos sem precisar reimprimir material sempre que mudar algo.',
  },
  {
    index: '02',
    title: 'Ofereça QR Code automático para o cliente',
    description:
      'Coloque o acesso ao cardápio nas mesas, no balcão, no delivery e no WhatsApp com um link simples e prático. Pedido por mesa via QR Code, com conta e fechamento por mesa.',
  },
  {
    index: '03',
    title: 'Passe mais profissionalismo e venda melhor',
    description:
      'Apresente seus produtos com um visual moderno, organizado e fácil de navegar em qualquer celular.',
  },
  {
    index: '04',
    title: 'Operação completa de salão',
    description:
      'Painel de salão por mesa, fechamento de conta por mesa, pagamento interno, comprovante da conta, dashboard e relatórios do restaurante para gestão do dia a dia.',
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
              Mais praticidade para o seu negócio e mais valor para o seu cliente.
            </h2>
          </div>

          <p className="max-w-2xl text-lg leading-8 text-gray-600">
            A Nexora foi pensada para restaurantes que querem apresentar melhor seus produtos,
            atualizar o cardápio com rapidez e vender com mais presença no digital.
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
                  Resultado real
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