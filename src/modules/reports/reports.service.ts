import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async salesSummary(tenantId: string, establishmentId: string, start: Date, end: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        establishmentId,
        status: { not: 'CANCELLED' },
        createdAt: { gte: start, lte: end },
      },
    });
    const total = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
    return { total, count: orders.length, start, end };
  }

  async ordersByDay(tenantId: string, establishmentId: string, start: Date, end: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        establishmentId,
        createdAt: { gte: start, lte: end },
      },
      select: { createdAt: true, totalAmount: true, status: true },
    });
    const byDay: Record<string, { count: number; total: number }> = {};
    for (const o of orders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { count: 0, total: 0 };
      byDay[day].count += 1;
      if (o.status !== 'CANCELLED') byDay[day].total += Number(o.totalAmount);
    }
    return byDay;
  }

  async topProducts(tenantId: string, establishmentId: string, start: Date, end: Date, limit = 10) {
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          tenantId,
          establishmentId,
          status: { not: 'CANCELLED' },
          createdAt: { gte: start, lte: end },
        },
      },
      select: { productId: true, productNameSnapshot: true, quantity: true, totalPrice: true },
    });
    const map = new Map<string, { name: string; quantity: number; total: number }>();
    for (const i of items) {
      const key = i.productId ?? '';
      const cur = map.get(key) ?? { name: i.productNameSnapshot, quantity: 0, total: 0 };
      cur.quantity += i.quantity;
      cur.total += Number(i.totalPrice);
      map.set(key, cur);
    }
    return Array.from(map.entries())
      .filter(([id]) => id !== '')
      .map(([id, v]) => ({ productId: id, ...v }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  async paymentMethods(tenantId: string, establishmentId: string, start: Date, end: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        establishmentId,
        status: { not: 'CANCELLED' },
        createdAt: { gte: start, lte: end },
      },
      select: { paymentMethod: true, totalAmount: true },
    });
    const byMethod: Record<string, number> = {};
    for (const o of orders) {
      const m = o.paymentMethod ?? 'outros';
      byMethod[m] = (byMethod[m] ?? 0) + Number(o.totalAmount);
    }
    return byMethod;
  }

  async customersReport(tenantId: string, _establishmentId: string) {
    const count = await this.prisma.customer.count({
      where: { tenantId },
    });
    return { total: count };
  }

  async cancelledOrders(tenantId: string, establishmentId: string, start: Date, end: Date) {
    return this.prisma.order.findMany({
      where: {
        tenantId,
        establishmentId,
        status: 'CANCELLED',
        createdAt: { gte: start, lte: end },
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async dashboard(tenantId: string, establishmentId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startChart = new Date(now);
    startChart.setDate(startChart.getDate() - 6);
    startChart.setHours(0, 0, 0, 0);

    const [ordersToday, ordersMonth, ordersAllForStats, topProducts, ordersByDayRaw, recentOrdersRaw] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          tenantId,
          establishmentId,
          status: { not: 'CANCELLED' },
          createdAt: { gte: startOfToday, lte: now },
        },
        select: { totalAmount: true },
      }),
      this.prisma.order.findMany({
        where: {
          tenantId,
          establishmentId,
          status: { not: 'CANCELLED' },
          createdAt: { gte: startOfMonth, lte: now },
        },
        select: { totalAmount: true },
      }),
      this.prisma.order.findMany({
        where: { tenantId, establishmentId, createdAt: { gte: startOfMonth, lte: now } },
        select: { status: true, totalAmount: true, createdAt: true },
      }),
      this.topProducts(tenantId, establishmentId, startOfMonth, now, 10),
      this.prisma.order.findMany({
        where: {
          tenantId,
          establishmentId,
          status: { not: 'CANCELLED' },
          createdAt: { gte: startChart, lte: now },
        },
        select: { createdAt: true, totalAmount: true },
      }),
      this.prisma.order.findMany({
        where: { tenantId, establishmentId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, orderNumber: true, totalAmount: true, status: true, createdAt: true },
      }),
    ]);

    const salesToday = ordersToday.reduce((s, o) => s + Number(o.totalAmount), 0);
    const salesMonth = ordersMonth.reduce((s, o) => s + Number(o.totalAmount), 0);
    const ordersTodayCount = ordersToday.length;
    const averageTicket = ordersTodayCount > 0 ? salesToday / ordersTodayCount : 0;

    const pendingOrders = ordersAllForStats.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
    const cancelledOrders = ordersAllForStats.filter((o) => o.status === 'CANCELLED').length;

    const byStatus: Record<string, number> = {};
    for (const o of ordersAllForStats) {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    }
    const ordersByStatus = Object.entries(byStatus).map(([status, count]) => ({ status, count }));

    const byDay: Record<string, { total: number; count: number }> = {};
    for (let d = new Date(startChart); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      byDay[key] = { total: 0, count: 0 };
    }
    for (const o of ordersByDayRaw) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (byDay[key]) {
        byDay[key].count += 1;
        byDay[key].total += Number(o.totalAmount);
      }
    }
    const salesChart = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      code: o.orderNumber,
      total: Number(o.totalAmount),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }));

    return {
      stats: {
        salesToday,
        salesMonth,
        ordersToday: ordersTodayCount,
        averageTicket,
        pendingOrders,
        cancelledOrders,
      },
      salesChart,
      ordersByStatus,
      topProducts,
      recentOrders,
    };
  }
}
