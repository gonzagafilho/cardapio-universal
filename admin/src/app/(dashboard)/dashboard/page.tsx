'use client';

import { useAuth } from '@/hooks/useAuth';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessDashboard } from '@/lib/permissions';
import { useDashboard } from '@/hooks/useDashboard';
import {
  StatCard,
  SalesChart,
  OrdersByStatus,
  TopProducts,
  RecentOrders,
} from '@/components/dashboard';
import { LoadingPage } from '@/components/ui/loading';

export default function DashboardPage() {
  const { user } = useAuth();
  const establishmentId = user?.establishmentId ?? undefined;
  const { data, loading, error } = useDashboard(establishmentId);

  if (!user) return null;

  if (!canAccessDashboard(user.role)) {
    return <AccessDenied description="Seu perfil não pode acessar o dashboard." />;
  }

  if (loading) return <LoadingPage />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
        {error}
      </div>
    );
  }

  const stats = data?.stats;
  const salesChart = data?.salesChart ?? [];
  const ordersByStatus = data?.ordersByStatus ?? [];
  const topProducts = data?.topProducts ?? [];
  const recentOrders = data?.recentOrders ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Visão geral da sua operação digital
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
              Acompanhe vendas, pedidos, produtos e desempenho do cardápio em um painel
              com leitura rápida e estrutura profissional.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                Operação
              </p>
              <p className="mt-2 text-sm font-medium text-black">Mais controle diário</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                Vendas
              </p>
              <p className="mt-2 text-sm font-medium text-black">Mais clareza de desempenho</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                Marca
              </p>
              <p className="mt-2 text-sm font-medium text-black">Mais valor percebido</p>
            </div>
          </div>
        </div>
      </section>

      {stats ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard title="Vendas hoje" value={stats.salesToday} format="currency" />
          <StatCard title="Vendas do mês" value={stats.salesMonth} format="currency" />
          <StatCard title="Pedidos hoje" value={stats.ordersToday} />
          <StatCard title="Ticket médio" value={stats.averageTicket} format="currency" />
          <StatCard title="Pendentes" value={stats.pendingOrders} />
          <StatCard title="Cancelados" value={stats.cancelledOrders} />
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:p-5">
          <SalesChart data={salesChart} />
        </div>
        <div className="rounded-[2rem] border border-gray-200 bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:p-5">
          <OrdersByStatus data={ordersByStatus} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:p-5">
          <TopProducts data={topProducts} />
        </div>
        <div className="rounded-[2rem] border border-gray-200 bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:p-5">
          <RecentOrders data={recentOrders} />
        </div>
      </section>
    </div>
  );
}