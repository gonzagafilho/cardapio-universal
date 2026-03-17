'use client';

import { formatCurrency } from '@/lib/currency';

function getCardMeta(title: string) {
  const normalized = title.trim().toLowerCase();

  if (normalized === 'vendas hoje') {
    return {
      eyebrow: 'Receita do dia',
      icon: '💵',
      subtitle: 'Faturamento acumulado nas vendas de hoje.',
      container: 'border-emerald-200 bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/40',
      badge: 'border-emerald-200 bg-white text-emerald-700',
      eyebrowText: 'text-emerald-700',
      accent: 'text-emerald-700',
    };
  }

  if (normalized === 'vendas do mês') {
    return {
      eyebrow: 'Resultado mensal',
      icon: '📈',
      subtitle: 'Desempenho total de vendas no mês atual.',
      container: 'border-sky-200 bg-gradient-to-br from-white via-sky-50/70 to-sky-100/40',
      badge: 'border-sky-200 bg-white text-sky-700',
      eyebrowText: 'text-sky-700',
      accent: 'text-sky-700',
    };
  }

  if (normalized === 'pedidos hoje') {
    return {
      eyebrow: 'Operação do dia',
      icon: '🍽️',
      subtitle: 'Quantidade de pedidos registrados hoje.',
      container: 'border-amber-200 bg-gradient-to-br from-white via-amber-50/70 to-amber-100/40',
      badge: 'border-amber-200 bg-white text-amber-700',
      eyebrowText: 'text-amber-700',
      accent: 'text-amber-700',
    };
  }

  if (normalized === 'ticket médio') {
    return {
      eyebrow: 'Consumo médio',
      icon: '🧾',
      subtitle: 'Valor médio gasto por pedido no período.',
      container: 'border-violet-200 bg-gradient-to-br from-white via-violet-50/70 to-violet-100/40',
      badge: 'border-violet-200 bg-white text-violet-700',
      eyebrowText: 'text-violet-700',
      accent: 'text-violet-700',
    };
  }

  if (normalized === 'pendentes') {
    return {
      eyebrow: 'Fila da cozinha',
      icon: '⏳',
      subtitle: 'Pedidos aguardando andamento no fluxo.',
      container: 'border-orange-200 bg-gradient-to-br from-white via-orange-50/70 to-orange-100/40',
      badge: 'border-orange-200 bg-white text-orange-700',
      eyebrowText: 'text-orange-700',
      accent: 'text-orange-700',
    };
  }

  if (normalized === 'cancelados') {
    return {
      eyebrow: 'Atenção',
      icon: '⚠️',
      subtitle: 'Pedidos encerrados sem conclusão da venda.',
      container: 'border-rose-200 bg-gradient-to-br from-white via-rose-50/70 to-rose-100/40',
      badge: 'border-rose-200 bg-white text-rose-700',
      eyebrowText: 'text-rose-700',
      accent: 'text-rose-700',
    };
  }

  return {
    eyebrow: 'Resumo',
    icon: '📊',
    subtitle: 'Indicador consolidado do painel.',
    container: 'border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100/50',
    badge: 'border-gray-200 bg-white text-gray-700',
    eyebrowText: 'text-gray-600',
    accent: 'text-gray-700',
  };
}

export function StatCard({
  title,
  value,
  format = 'number',
  subtitle,
}: {
  title: string;
  value: number | string;
  format?: 'number' | 'currency';
  subtitle?: string;
}) {
  const display =
    format === 'currency' && typeof value === 'number'
      ? formatCurrency(value)
      : value;

  const meta = getCardMeta(title);

  return (
    <div
       className={`group relative overflow-hidden rounded-lg border px-5 py-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${meta.container}`}
    >
      <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),transparent_38%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.20em] ${meta.eyebrowText}`}>
              {meta.eyebrow}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {title}
            </p>
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-xl shadow-sm ${meta.badge}`}
          >
            {meta.icon}
          </div>
        </div>

        <p className="mt-4 text-[1.9rem] font-semibold tracking-tight text-slate-950">
          {display}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="max-w-[220px] text-xs leading-5 text-slate-600">
            {subtitle ?? meta.subtitle}
          </span>

          <span className={`shrink-0 text-xs font-semibold ${meta.accent}`}>
            Hoje
          </span>
        </div>
      </div>
    </div>
  );
}