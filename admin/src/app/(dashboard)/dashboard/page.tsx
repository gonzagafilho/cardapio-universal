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
    return <AccessDenied description="Seu perfil não pode acessar o início." />;
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
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Início
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Central de gestão do seu restaurante
            </h1>

            <p className="mt-4 text-base leading-7 text-gray-700 sm:text-lg">
              Acompanhe pedidos, cardápio, clientes e faturamento do seu restaurante em um único painel.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[500px]">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-white text-xl shadow-sm">
                ⏳
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                Pendentes
              </p>

              <p className="mt-2 text-sm font-medium leading-6 text-gray-900">
                Pedidos aguardando início do preparo.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-200 bg-white text-xl shadow-sm">
                🍳
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
                Em preparo
              </p>

              <p className="mt-2 text-sm font-medium leading-6 text-gray-900">
                Pedidos em andamento na cozinha.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-xl shadow-sm">
                ✅
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Finalizados
              </p>

              <p className="mt-2 text-sm font-medium leading-6 text-gray-900">
                Pedidos concluídos e liberados no fluxo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {stats ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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