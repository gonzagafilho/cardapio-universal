'use client';

import { useAuth } from '@/hooks/useAuth';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { canAccessDashboard } from '@/lib/permissions';
import { useDashboard } from '@/hooks/useDashboard';
import { StatCard, SalesChart, OrdersByStatus, TopProducts, RecentOrders } from '@/components/dashboard';
import { LoadingPage } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/currency';

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
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Vendas hoje" value={stats.salesToday} format="currency" />
          <StatCard title="Vendas do mês" value={stats.salesMonth} format="currency" />
          <StatCard title="Pedidos hoje" value={stats.ordersToday} />
          <StatCard title="Ticket médio" value={stats.averageTicket} format="currency" />
          <StatCard title="Pendentes" value={stats.pendingOrders} />
          <StatCard title="Cancelados" value={stats.cancelledOrders} />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={salesChart} />
        <OrdersByStatus data={ordersByStatus} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TopProducts data={topProducts} />
        <RecentOrders data={recentOrders} />
      </div>
    </div>
  );
}
