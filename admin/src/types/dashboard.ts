export interface DashboardStats {
  salesToday: number;
  salesMonth: number;
  ordersToday: number;
  averageTicket: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export interface DashboardData {
  stats: DashboardStats;
  salesChart: { date: string; total: number; count: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { productId: string; name: string; quantity: number; total: number }[];
  recentOrders: { id: string; code: string; total: number; status: string; createdAt: string }[];
}
