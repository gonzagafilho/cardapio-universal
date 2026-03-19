import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TableSessionPaymentStatus, TableSessionStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { getEndOfDaySP, getRangeSP, getStartOfDaySP } from './date-range.helper';
import { randomUUID } from 'crypto';

const MP_API_BASE = 'https://api.mercadopago.com';

@Injectable()
export class TableSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Retorna a sessão aberta da mesa ou cria uma nova. Usado ao criar pedido com tableId.
   * Aceita tx para uso dentro de transação (ex.: criação de pedido).
   */
  async findOpenOrCreate(
    tenantId: string,
    establishmentId: string,
    tableId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string }> {
    const run = async (client: Prisma.TransactionClient): Promise<{ id: string }> => {
      const existing = await client.tableSession.findFirst({
        where: {
          tenantId,
          establishmentId,
          tableId,
          status: TableSessionStatus.OPEN,
        },
        orderBy: [{ openedAt: 'desc' }, { createdAt: 'desc' }],
        select: { id: true },
      });
      if (existing) return { id: existing.id };

      try {
        const created = await client.tableSession.create({
          data: {
            tenantId,
            establishmentId,
            tableId,
            status: TableSessionStatus.OPEN,
          },
          select: { id: true },
        });
        return { id: created.id };
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          const concurrent = await client.tableSession.findFirst({
            where: {
              tenantId,
              establishmentId,
              tableId,
              status: TableSessionStatus.OPEN,
            },
            orderBy: [{ openedAt: 'desc' }, { createdAt: 'desc' }],
            select: { id: true },
          });
          if (concurrent) return { id: concurrent.id };
        }
        throw err;
      }
    };

    if (tx) {
      return run(tx);
    }

    return this.prisma.$transaction(
      (trx) => run(trx),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /** Abre uma nova sessão para a mesa (uso explícito pelo admin no futuro). */
  async openTableSession(
    tenantId: string,
    establishmentId: string,
    tableId: string,
  ) {
    await this.prisma.table.findFirstOrThrow({
      where: { id: tableId, tenantId, establishmentId, isActive: true },
    });
    const session = await this.findOpenOrCreate(tenantId, establishmentId, tableId);
    return this.prisma.tableSession.findFirstOrThrow({
      where: { id: session.id, tenantId, establishmentId, tableId },
    });
  }

  /** Retorna a sessão OPEN da mesa, se existir. */
  async findOpenSessionByTable(
    tenantId: string,
    establishmentId: string,
    tableId: string,
  ): Promise<{ id: string } | null> {
    const session = await this.prisma.tableSession.findFirst({
      where: {
        tenantId,
        establishmentId,
        tableId,
        status: TableSessionStatus.OPEN,
      },
      select: { id: true },
    });
    return session;
  }

  /**
   * Retorna a sessão OPEN da mesa por tableId (resolve establishmentId via mesa).
   * Fonte de verdade para UI: mesa ativa = sessão OPEN existe.
   */
  async getOpenSessionByTable(
    tenantId: string,
    tableId: string,
  ): Promise<{ id: string } | null> {
    const table = await this.prisma.table.findFirst({
      where: { id: tableId, tenantId },
      select: { establishmentId: true },
    });
    if (!table) return null;
    return this.findOpenSessionByTable(
      tenantId,
      table.establishmentId,
      tableId,
    );
  }

  /**
   * Retorna a sessão OPEN atual de cada mesa do estabelecimento (batch).
   * Apenas mesas do tenant; sem sessão OPEN retorna session: null.
   */
  async getOpenSessionsByEstablishment(
    tenantId: string,
    establishmentId: string,
  ): Promise<Array<{ tableId: string; session: { id: string } | null }>> {
    const tables = await this.prisma.table.findMany({
      where: { tenantId, establishmentId },
      select: { id: true },
    });
    if (tables.length === 0) return [];

    const tableIds = tables.map((t) => t.id);
    const openSessions = await this.prisma.tableSession.findMany({
      where: {
        tenantId,
        establishmentId,
        tableId: { in: tableIds },
        status: TableSessionStatus.OPEN,
      },
      select: { id: true, tableId: true },
    });
    const sessionByTableId = new Map(
      openSessions.map((s) => [s.tableId, { id: s.id }]),
    );
    return tables.map((t) => ({
      tableId: t.id,
      session: sessionByTableId.get(t.id) ?? null,
    }));
  }

  /**
   * Lista sessões da mesa (histórico), ordenadas por openedAt DESC.
   * Usado pelo admin para exibir histórico de fechamentos.
   */
  async getSessionsByTable(
    tenantId: string,
    tableId: string,
    limit = 10,
  ): Promise<
    Array<{
      id: string;
      openedAt: Date;
      closedAt: Date | null;
      totalAmount: unknown;
      serviceFeeAmount: unknown;
      discountAmount: unknown;
      finalAmount: unknown;
      paymentStatus: string;
      status: string;
    }>
  > {
    const table = await this.prisma.table.findFirst({
      where: { id: tableId, tenantId },
      select: { id: true },
    });
    if (!table) {
      throw new NotFoundException('Mesa não encontrada');
    }
    const sessions = await this.prisma.tableSession.findMany({
      where: { tenantId, tableId },
      orderBy: { openedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        openedAt: true,
        closedAt: true,
        totalAmount: true,
        serviceFeeAmount: true,
        discountAmount: true,
        finalAmount: true,
        paymentStatus: true,
        status: true,
      },
    });
    return sessions;
  }

  /**
   * Estatísticas do salão para o dia (America/Sao_Paulo).
   * Usado pelo dashboard global do /salon.
   */
  async getStatsToday(
    tenantId: string,
    establishmentId: string,
  ): Promise<{
    sessionsToday: number;
    revenueToday: number;
    activeTablesCount: number;
    averageTicket: number | null;
    paidSessionsToday: number;
    pendingPaymentSessionsToday: number;
  }> {
    const startOfToday = getStartOfDaySP();
    const endOfToday = getEndOfDaySP();

    const [sessionsOpenedToday, sessionsClosedToday, openSessions, paidCount, pendingCount] =
      await Promise.all([
        this.prisma.tableSession.count({
          where: {
            tenantId,
            establishmentId,
            openedAt: { gte: startOfToday, lte: endOfToday },
          },
        }),
        this.prisma.tableSession.findMany({
          where: {
            tenantId,
            establishmentId,
            status: TableSessionStatus.CLOSED,
            closedAt: { gte: startOfToday, lte: endOfToday },
          },
          select: { totalAmount: true, finalAmount: true },
        }),
        this.prisma.tableSession.findMany({
          where: {
            tenantId,
            establishmentId,
            status: TableSessionStatus.OPEN,
          },
          select: { tableId: true },
        }),
        this.prisma.tableSession.count({
          where: {
            tenantId,
            establishmentId,
            status: TableSessionStatus.CLOSED,
            closedAt: { gte: startOfToday, lte: endOfToday },
            paymentStatus: TableSessionPaymentStatus.PAID,
          },
        }),
        this.prisma.tableSession.count({
          where: {
            tenantId,
            establishmentId,
            status: TableSessionStatus.CLOSED,
            closedAt: { gte: startOfToday, lte: endOfToday },
            paymentStatus: TableSessionPaymentStatus.PENDING,
          },
        }),
      ]);

    const revenueToday = sessionsClosedToday.reduce((acc, s) => {
      const amount = s.finalAmount != null ? Number(s.finalAmount) : Number(s.totalAmount ?? 0);
      return acc + amount;
    }, 0);
    const closedWithTotal = sessionsClosedToday.filter(
      (s) => s.finalAmount != null || s.totalAmount != null,
    ).length;
    const averageTicket =
      closedWithTotal > 0 ? revenueToday / closedWithTotal : null;
    const activeTablesCount = new Set(openSessions.map((s) => s.tableId)).size;

    return {
      sessionsToday: sessionsOpenedToday,
      revenueToday,
      activeTablesCount,
      averageTicket: averageTicket ?? null,
      paidSessionsToday: paidCount,
      pendingPaymentSessionsToday: pendingCount,
    };
  }

  /**
   * Relatório do dia para o estabelecimento (America/Sao_Paulo).
   */
  async getReportToday(
    tenantId: string,
    establishmentId: string,
  ): Promise<{
    revenueToday: number;
    sessionsCount: number;
    paidSessions: number;
    pendingSessions: number;
    averageTicket: number | null;
    tableRanking: Array<{ tableId: string; tableName: string; totalRevenue: number; paidRevenue: number; sessionsCount: number; averageTicket: number }>;
  }> {
    const startOfToday = getStartOfDaySP();
    const endOfToday = getEndOfDaySP();

    const closedSessions = await this.prisma.tableSession.findMany({
      where: {
        tenantId,
        establishmentId,
        status: TableSessionStatus.CLOSED,
        closedAt: { gte: startOfToday, lte: endOfToday },
      },
      select: {
        tableId: true,
        totalAmount: true,
        finalAmount: true,
        paymentStatus: true,
      },
    });

    const revenueToday = closedSessions.reduce((acc, s) => {
      const amount = s.finalAmount != null ? Number(s.finalAmount) : Number(s.totalAmount ?? 0);
      return acc + amount;
    }, 0);
    const sessionsCount = closedSessions.length;
    const paidSessions = closedSessions.filter((s) => s.paymentStatus === TableSessionPaymentStatus.PAID).length;
    const pendingSessions = closedSessions.filter((s) => s.paymentStatus === TableSessionPaymentStatus.PENDING).length;
    const withTotal = closedSessions.filter((s) => s.finalAmount != null || s.totalAmount != null);
    const averageTicket = withTotal.length > 0 ? revenueToday / withTotal.length : null;

    const byTable = new Map<
      string,
      { totalRevenue: number; paidRevenue: number; sessionsCount: number }
    >();
    for (const s of closedSessions) {
      const amount = s.finalAmount != null ? Number(s.finalAmount) : Number(s.totalAmount ?? 0);
      const cur = byTable.get(s.tableId) ?? { totalRevenue: 0, paidRevenue: 0, sessionsCount: 0 };
      cur.totalRevenue += amount;
      if (s.paymentStatus === TableSessionPaymentStatus.PAID) cur.paidRevenue += amount;
      cur.sessionsCount += 1;
      byTable.set(s.tableId, cur);
    }
    const tableIds = Array.from(byTable.keys());
    const tables = await this.prisma.table.findMany({
      where: { id: { in: tableIds }, tenantId },
      select: { id: true, name: true, number: true },
    });
    const tableById = new Map(tables.map((t) => [t.id, t]));
    const tableRanking = tableIds
      .map((tableId) => {
        const t = tableById.get(tableId);
        const row = byTable.get(tableId)!;
        const tableName =
          t?.number != null && String(t.number).trim() !== ''
            ? `Mesa ${t.number}`
            : t?.name ?? 'Mesa';
        return {
          tableId,
          tableName,
          totalRevenue: row.totalRevenue,
          paidRevenue: row.paidRevenue,
          sessionsCount: row.sessionsCount,
          averageTicket: row.sessionsCount > 0 ? row.totalRevenue / row.sessionsCount : 0,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      revenueToday,
      sessionsCount,
      paidSessions,
      pendingSessions,
      averageTicket: averageTicket ?? null,
      tableRanking,
    };
  }

  /**
   * Fechamento de caixa do dia (America/Sao_Paulo).
   */
  async getCashierSummary(tenantId: string, establishmentId: string) {
    const startOfToday = getStartOfDaySP();
    const endOfToday = getEndOfDaySP();

    const [closedSessions, openSessions] = await Promise.all([
      this.prisma.tableSession.findMany({
        where: {
          tenantId,
          establishmentId,
          status: TableSessionStatus.CLOSED,
          closedAt: { gte: startOfToday, lte: endOfToday },
        },
        select: { finalAmount: true, totalAmount: true, paymentStatus: true },
      }),
      this.prisma.tableSession.findMany({
        where: {
          tenantId,
          establishmentId,
          status: TableSessionStatus.OPEN,
        },
        select: { id: true },
      }),
    ]);

    let paidRevenueToday = 0;
    let pendingRevenueToday = 0;
    let paidSessionsToday = 0;
    let pendingSessionsToday = 0;
    for (const s of closedSessions) {
      const amount = s.finalAmount != null ? Number(s.finalAmount) : Number(s.totalAmount ?? 0);
      if (s.paymentStatus === TableSessionPaymentStatus.PAID) {
        paidRevenueToday += amount;
        paidSessionsToday += 1;
      } else {
        pendingRevenueToday += amount;
        pendingSessionsToday += 1;
      }
    }
    const averagePaidTicketToday =
      paidSessionsToday > 0 ? paidRevenueToday / paidSessionsToday : null;

    return {
      paidRevenueToday,
      pendingRevenueToday,
      closedSessionsToday: closedSessions.length,
      openSessionsNow: openSessions.length,
      paidSessionsToday,
      pendingSessionsToday,
      averagePaidTicketToday: averagePaidTicketToday ?? null,
    };
  }

  /**
   * Relatório por período (closedAt no intervalo, America/Sao_Paulo para datas).
   */
  async getReportRange(
    tenantId: string,
    establishmentId: string,
    from: string,
    to: string,
  ): Promise<{
    revenue: number;
    paidRevenue: number;
    pendingRevenue: number;
    sessionsCount: number;
    paidSessions: number;
    pendingSessions: number;
    averageTicket: number | null;
    tableRanking: Array<{
      tableId: string;
      tableName: string;
      totalRevenue: number;
      paidRevenue: number;
      sessionsCount: number;
      averageTicket: number;
    }>;
  }> {
    const { fromDate, toDate } = getRangeSP(from, to);

    const closedSessions = await this.prisma.tableSession.findMany({
      where: {
        tenantId,
        establishmentId,
        status: TableSessionStatus.CLOSED,
        closedAt: { gte: fromDate, lte: toDate },
      },
      select: {
        tableId: true,
        totalAmount: true,
        finalAmount: true,
        paymentStatus: true,
      },
    });

    let revenue = 0;
    let paidRevenue = 0;
    let pendingRevenue = 0;
    for (const s of closedSessions) {
      const amount = s.finalAmount != null ? Number(s.finalAmount) : Number(s.totalAmount ?? 0);
      revenue += amount;
      if (s.paymentStatus === TableSessionPaymentStatus.PAID) paidRevenue += amount;
      else pendingRevenue += amount;
    }
    const sessionsCount = closedSessions.length;
    const paidSessions = closedSessions.filter((s) => s.paymentStatus === TableSessionPaymentStatus.PAID).length;
    const pendingSessions = closedSessions.filter((s) => s.paymentStatus === TableSessionPaymentStatus.PENDING).length;
    const averageTicket = sessionsCount > 0 ? revenue / sessionsCount : null;

    const byTable = new Map<
      string,
      { totalRevenue: number; paidRevenue: number; sessionsCount: number }
    >();
    for (const s of closedSessions) {
      const amount = s.finalAmount != null ? Number(s.finalAmount) : Number(s.totalAmount ?? 0);
      const cur = byTable.get(s.tableId) ?? { totalRevenue: 0, paidRevenue: 0, sessionsCount: 0 };
      cur.totalRevenue += amount;
      if (s.paymentStatus === TableSessionPaymentStatus.PAID) cur.paidRevenue += amount;
      cur.sessionsCount += 1;
      byTable.set(s.tableId, cur);
    }
    const tableIds = Array.from(byTable.keys());
    const tables = await this.prisma.table.findMany({
      where: { id: { in: tableIds }, tenantId },
      select: { id: true, name: true, number: true },
    });
    const tableById = new Map(tables.map((t) => [t.id, t]));
    const tableRanking = tableIds
      .map((tableId) => {
        const t = tableById.get(tableId);
        const row = byTable.get(tableId)!;
        const tableName =
          t?.number != null && String(t.number).trim() !== ''
            ? `Mesa ${t.number}`
            : t?.name ?? 'Mesa';
        return {
          tableId,
          tableName,
          totalRevenue: row.totalRevenue,
          paidRevenue: row.paidRevenue,
          sessionsCount: row.sessionsCount,
          averageTicket: row.sessionsCount > 0 ? row.totalRevenue / row.sessionsCount : 0,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      revenue,
      paidRevenue,
      pendingRevenue,
      sessionsCount,
      paidSessions,
      pendingSessions,
      averageTicket: averageTicket ?? null,
      tableRanking,
    };
  }

  /** Encerra a sessão (closedAt + status CLOSED) e grava totalAmount consolidado dos pedidos. */
  async closeTableSession(tenantId: string, sessionId: string) {
    const session = await this.prisma.tableSession.findFirst({
      where: { id: sessionId, tenantId },
    });
    if (!session) {
      throw new NotFoundException('Sessão de mesa não encontrada');
    }
    const aggregate = await this.prisma.order.aggregate({
      where: { tableSessionId: sessionId },
      _sum: { totalAmount: true },
    });
    const totalAmount = aggregate._sum.totalAmount ?? null;
    const total = totalAmount != null ? Number(totalAmount) : 0;
    const finalAmount = total; // totalAmount + serviceFee - discount (por ora só total)
    return this.prisma.tableSession.update({
      where: { id: sessionId },
      data: {
        closedAt: new Date(),
        status: TableSessionStatus.CLOSED,
        totalAmount,
        serviceFeeAmount: null,
        discountAmount: null,
        finalAmount: totalAmount != null ? finalAmount : null,
        paymentStatus: TableSessionPaymentStatus.PENDING,
      },
    });
  }

  /**
   * Encerra a sessão aberta da mesa, se existir.
   * Retorna a sessão encerrada ou null se não houver sessão OPEN.
   */
  async closeOpenSessionByTable(
    tenantId: string,
    tableId: string,
  ): Promise<{ closed: true; session: Awaited<ReturnType<TableSessionService['closeTableSession']>> } | { closed: false }> {
    const table = await this.prisma.table.findFirst({
      where: { id: tableId, tenantId },
      select: { establishmentId: true },
    });
    if (!table) {
      throw new NotFoundException('Mesa não encontrada');
    }
    const openSession = await this.findOpenSessionByTable(
      tenantId,
      table.establishmentId,
      tableId,
    );
    if (!openSession) {
      return { closed: false };
    }
    const session = await this.closeTableSession(tenantId, openSession.id);
    return { closed: true, session };
  }

  /**
   * Atualiza conta da sessão (taxa de serviço e desconto) e recalcula finalAmount.
   * Não permite editar se paymentStatus = PAID.
   */
  async updateSessionAccount(
    tenantId: string,
    sessionId: string,
    data: { serviceFeeAmount?: number; discountAmount?: number },
  ) {
    const session = await this.prisma.tableSession.findFirst({
      where: { id: sessionId, tenantId },
      select: { id: true, totalAmount: true, paymentStatus: true },
    });
    if (!session) {
      throw new NotFoundException('Sessão de mesa não encontrada');
    }
    if (session.paymentStatus === TableSessionPaymentStatus.PAID) {
      throw new BadRequestException('Conta já paga. Não é possível editar taxa ou desconto.');
    }
    const serviceFee = Math.max(0, Number(data.serviceFeeAmount) || 0);
    const discount = Math.max(0, Number(data.discountAmount) || 0);
    const total = session.totalAmount != null ? Number(session.totalAmount) : 0;
    const finalAmount = Math.max(0, total + serviceFee - discount);
    return this.prisma.tableSession.update({
      where: { id: sessionId },
      data: {
        serviceFeeAmount: serviceFee,
        discountAmount: discount,
        finalAmount,
      },
    });
  }

  /**
   * Marca sessão como paga. Apenas sessões CLOSED.
   */
  async markSessionAsPaid(tenantId: string, sessionId: string) {
    const session = await this.prisma.tableSession.findFirst({
      where: { id: sessionId, tenantId },
      select: { id: true, status: true },
    });
    if (!session) {
      throw new NotFoundException('Sessão de mesa não encontrada');
    }
    if (session.status !== TableSessionStatus.CLOSED) {
      throw new BadRequestException(
        'Apenas sessões encerradas podem ser marcadas como pagas.',
      );
    }
    return this.prisma.tableSession.update({
      where: { id: sessionId },
      data: { paymentStatus: TableSessionPaymentStatus.PAID },
    });
  }

  /**
   * Cria pagamento PIX (Mercado Pago) para uma sessão encerrada.
   * Associação com a sessão ocorre via `external_reference = sessionId`.
   */
  async createSessionPix(
    tenantId: string,
    sessionId: string,
    data: { payerEmail?: string },
  ): Promise<{
    mpPaymentId: string | null;
    status?: string;
    qrCodeBase64: string | null;
    qrCode: string | null;
    expiresAt?: null;
  }> {
    const session = await this.prisma.tableSession.findFirst({
      where: { id: sessionId, tenantId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        finalAmount: true,
        totalAmount: true,
        establishmentId: true,
      },
    });
    if (!session) throw new NotFoundException('Sessão de mesa não encontrada');
    if (session.status !== TableSessionStatus.CLOSED) {
      throw new BadRequestException(
        'Apenas sessões encerradas podem gerar PIX.',
      );
    }
    if (session.paymentStatus === TableSessionPaymentStatus.PAID) {
      throw new BadRequestException('Sessão já está paga.');
    }

    const amount =
      session.finalAmount != null ? Number(session.finalAmount) : Number(session.totalAmount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Valor final da conta inválido para PIX.');
    }

    const accessToken = this.config.get<string>('mercadopago.accessToken');
    if (!accessToken?.trim()) {
      throw new BadRequestException('Pagamento PIX não configurado (Mercado Pago)');
    }

    const notificationUrl = this.config.get<string>('mercadopago.paymentNotificationUrl');

    const body: Record<string, unknown> = {
      transaction_amount: Math.round(amount * 100) / 100,
      payment_method_id: 'pix',
      payer: { email: data.payerEmail || 'cliente@email.com' },
      description: `Conta da mesa (sessão ${session.id})`,
      external_reference: session.id,
    };
    if (notificationUrl?.trim()) {
      body.notification_url = notificationUrl.trim();
    }

    const idempotencyKey = randomUUID();
    const res = await fetch(`${MP_API_BASE}/v1/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(body),
    });

    const mpData = (await res.json().catch(() => ({}))) as {
      id?: number;
      status?: string;
      point_of_interaction?: {
        transaction_data?: {
          qr_code_base64?: string;
          qr_code?: string;
        };
      };
      message?: string;
    };

    if (!res.ok) {
      throw new BadRequestException(
        mpData.message ?? mpData.status ?? 'Falha ao gerar PIX',
      );
    }

    const mpPaymentId = mpData.id != null ? String(mpData.id) : null;
    const pointOfInteraction = mpData.point_of_interaction?.transaction_data;
    const qrCodeBase64 = pointOfInteraction?.qr_code_base64 ?? null;
    const qrCode = pointOfInteraction?.qr_code ?? null;

    return {
      mpPaymentId,
      status: mpData.status,
      qrCodeBase64,
      qrCode,
      expiresAt: pointOfInteraction ? null : undefined,
    };
  }
}
