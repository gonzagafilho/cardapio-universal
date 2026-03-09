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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [salesSummary, ordersCount, topProducts] = await Promise.all([
      this.salesSummary(tenantId, establishmentId, startOfMonth, now),
      this.prisma.order.count({
        where: { tenantId, establishmentId, status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth } },
      }),
      this.topProducts(tenantId, establishmentId, startOfMonth, now, 5),
    ]);
    return {
      salesSummary,
      ordersCount,
      topProducts,
    };
  }
}
