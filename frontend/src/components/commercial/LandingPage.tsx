import Link from 'next/link';
import { ADMIN_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { CommercialLayout } from './CommercialLayout';

export function LandingPage() {
  return (
    <CommercialLayout>
      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            Crie seu cardápio digital profissional
          </h1>
          <p className="mt-4 text-lg text-gray-600 sm:text-xl">
            Receba pedidos e tenha seu link com QR Code em minutos. Sem complicação.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={`${ADMIN_URL}/onboarding`}>
              <Button size="lg" className="w-full sm:w-auto">
                Criar minha conta
              </Button>
            </Link>
            <Link href="/planos">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver planos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Tudo que você precisa para vender mais
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-gray-600">
            Ferramentas pensadas para restaurantes, bares e delivery.
          </p>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Cardápio online profissional', desc: 'Apresente seus produtos com fotos e descrições.' },
              { title: 'QR Code automático', desc: 'Gere e baixe o QR Code do seu cardápio no painel.' },
              { title: 'Pedidos organizados', desc: 'Receba e gerencie pedidos em um só lugar.' },
              { title: 'Painel administrativo', desc: 'Configure categorias, produtos e horários com facilidade.' },
              { title: 'Domínio personalizado', desc: 'Use seu próprio domínio (ex.: menu.sualoja.com.br).' },
              { title: 'Onboarding rápido', desc: 'Crie sua conta e sua primeira loja em poucos passos.' },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Como funciona
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { step: 1, title: 'Crie sua conta', desc: 'Cadastre sua empresa e seu primeiro estabelecimento em poucos cliques.' },
              { step: 2, title: 'Configure sua loja', desc: 'Adicione categorias, produtos e personalize o cardápio.' },
              { step: 3, title: 'Compartilhe seu cardápio', desc: 'Use o link único ou o QR Code para seus clientes acessarem.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos resumidos */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Planos para cada etapa
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-gray-600">
            Do primeiro estabelecimento à rede. Escolha o que cabe no seu negócio.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {['Basic', 'Pro', 'Enterprise'].map((name, i) => (
              <div
                key={name}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm"
              >
                <p className="font-semibold text-gray-900">{name}</p>
                <p className="mt-2 text-sm text-gray-600">Sob consulta</p>
                <Link href="/planos" className="mt-4 block">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver detalhes
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/planos">
              <Button size="lg">Ver todos os planos</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Prova visual / demo */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Seu cardápio em qualquer dispositivo
          </h2>
          <p className="mt-2 text-gray-600">
            Layout responsivo. Seus clientes acessam pelo celular ou computador.
          </p>
          <div className="mt-10 flex justify-center">
            <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-lg">
              <div className="flex h-48 w-72 items-center justify-center rounded-lg bg-gray-100 text-gray-400 sm:w-80">
                Preview do cardápio
              </div>
              <p className="mt-3 text-sm text-gray-500">Exemplo de visual do cardápio</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-gray-100 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Pronto para começar?
          </h2>
          <p className="mt-2 text-gray-600">
            Crie sua conta grátis e coloque seu cardápio no ar em minutos.
          </p>
          <div className="mt-8">
            <Link href={`${ADMIN_URL}/onboarding`}>
              <Button size="lg" className="w-full sm:w-auto">
                Criar minha conta
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Já tem conta?{' '}
            <a href={`${ADMIN_URL}/login`} className="font-medium text-primary hover:underline">
              Entrar
            </a>
          </p>
        </div>
      </section>
    </CommercialLayout>
  );
}
