'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

type TopbarProps = {
  onOpenSidebar?: () => void;
};

const PAGE_META: Record<string, { eyebrow: string; title: string; description: string }> = {
  '/dashboard': {
    eyebrow: 'Visão geral',
    title: 'Dashboard',
    description: 'Acompanhe os principais indicadores da operação em tempo real.',
  },
  '/establishments': {
    eyebrow: 'Estrutura',
    title: 'Estabelecimentos',
    description: 'Gerencie as unidades e informações principais do restaurante.',
  },
  '/categories': {
    eyebrow: 'Organização',
    title: 'Categorias',
    description: 'Estruture o cardápio com categorias claras e bem distribuídas.',
  },
  '/products': {
    eyebrow: 'Catálogo',
    title: 'Produtos',
    description: 'Cadastre, atualize e organize os itens exibidos no cardápio.',
  },
  '/orders': {
    eyebrow: 'Operação',
    title: 'Pedidos',
    description: 'Visualize e acompanhe o fluxo completo dos pedidos recebidos.',
  },
  '/customers': {
    eyebrow: 'Relacionamento',
    title: 'Clientes',
    description: 'Consulte a base de clientes e acompanhe recorrência de consumo.',
  },
  '/payments': {
    eyebrow: 'Financeiro',
    title: 'Pagamentos',
    description: 'Monitore cobranças, recebimentos e status das transações.',
  },
  '/coupons': {
    eyebrow: 'Campanhas',
    title: 'Cupons',
    description: 'Crie e gerencie incentivos comerciais para aumentar conversão.',
  },
  '/reports': {
    eyebrow: 'Análise',
    title: 'Relatórios',
    description: 'Extraia informações estratégicas para decisões de crescimento.',
  },
  '/settings': {
    eyebrow: 'Preferências',
    title: 'Configurações',
    description: 'Ajuste parâmetros da plataforma e preferências do ambiente.',
  },
  '/users': {
    eyebrow: 'Acesso',
    title: 'Usuários',
    description: 'Gerencie usuários, permissões e níveis de acesso do sistema.',
  },
  '/billing': {
    eyebrow: 'Assinatura',
    title: 'Billing',
    description: 'Acompanhe plano, cobrança e status da assinatura do SaaS.',
  },
};

const ANNOUNCEMENTS = [
  {
    title: 'Tenha um e-mail profissional com a NexoraCloud',
    description:
      'Passe mais credibilidade para seu negócio com e-mail profissional, domínio próprio e configuração completa.',
    theme: 'border-sky-200 bg-gradient-to-r from-white via-sky-50 to-cyan-50',
  },
  {
    title: 'Crie seu chatbot e automatize seu atendimento',
    description:
      'Tenha um chatbot conectado ao seu negócio para responder clientes, organizar atendimento e acelerar vendas.',
    theme: 'border-violet-200 bg-gradient-to-r from-white via-violet-50 to-fuchsia-50',
  },
  {
    title: 'Faça seu site e fortaleça sua presença digital',
    description:
      'Criamos seu site profissional para divulgar sua empresa, atrair clientes e posicionar melhor sua marca online.',
    theme: 'border-emerald-200 bg-gradient-to-r from-white via-emerald-50 to-teal-50',
  },
  {
    title: 'Deixe tudo automatizado com a nossa estrutura',
    description:
      'Integramos site, chatbot e atendimento para seu negócio funcionar com mais organização, agilidade e escala.',
    theme: 'border-amber-200 bg-gradient-to-r from-white via-amber-50 to-orange-50',
  },
];

function getInitials(name?: string) {
  if (!name) return 'AD';

  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return 'AD';

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const isPlatformAdmin = user?.role === 'SUPER_ADMIN';

  const page = useMemo(() => {
    const exact = PAGE_META[pathname];
    if (exact) {
      if (!isPlatformAdmin && pathname === '/dashboard') {
        return { eyebrow: 'Visão geral', title: 'Início', description: 'Acompanhe pedidos, vendas e operação do seu restaurante.' };
      }
      return exact;
    }

    const match = Object.entries(PAGE_META)
      .filter(([key]) => key !== '/dashboard')
      .find(([key]) => pathname.startsWith(key + '/'));

    if (match) return match[1];

    if (!isPlatformAdmin && pathname === '/dashboard') {
      return { eyebrow: 'Visão geral', title: 'Início', description: 'Acompanhe pedidos, vendas e operação do seu restaurante.' };
    }
    return PAGE_META['/dashboard'];
  }, [pathname, isPlatformAdmin]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const announcement = ANNOUNCEMENTS[announcementIndex];
  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex min-h-[64px] items-start gap-3">
              <button
                type="button"
                className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm lg:hidden"
                onClick={onOpenSidebar}
              >
                ☰
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:text-[11px]">
                  {page.eyebrow}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950">
                    {page.title}
                  </h1>

                  {isPlatformAdmin ? (
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      Admin SaaS
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* ANÚNCIO: apenas para SUPER_ADMIN (plataforma); cliente restaurante não vê */}
            {isPlatformAdmin ? (
              <div
                className={`mt-4 overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 ${announcement.theme}`}
              >
                <div className="flex items-center gap-6">

                  {/* LOGO GRANDE */}
                  <div className="flex h-22 w-48 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <img
                      src="/nexoracloud-core.png"
                      alt="NexoraCloud"
                      className="h-22 w-40 object-contain"
                    />
                  </div>

                  {/* TEXTO */}
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-slate-500">
                      Anúncio do painel
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                      {announcement.title}
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                      {announcement.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* USUÁRIO */}
          <div className="flex shrink-0 items-center gap-3 xl:pt-1">
            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                {initials}
              </div>

              <div className="max-w-[180px]">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name ?? 'Administrador'}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user?.email ?? 'Painel administrativo'}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-2xl border-slate-300 bg-white px-4 text-slate-700 shadow-sm hover:bg-slate-50 sm:h-11"
              onClick={logout}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}