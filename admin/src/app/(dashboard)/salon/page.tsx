'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { getEstablishmentTables } from '@/services/table.service';
import {
  closeTableSession,
  getOpenSessionsByEstablishment,
  getSalonStatsToday,
  getSessionsByTable,
  updateSessionAccount,
  createSessionPix,
  markSessionAsPaid,
} from '@/services/table-session.service';
import type {
  TableSessionHistoryItem,
  SalonStatsToday,
  CreateSessionPixResponse,
} from '@/services/table-session.service';
import { LoadingPage } from '@/components/ui/loading';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/format';
import { canAccessSalon } from '@/lib/permissions';
import type { Order } from '@/types/order';
import type { Table } from '@/types/table';

type TableSummary = {
  table: Table;
  orders: Order[];
  recentOrders: Order[];
  lastOrder: Order | null;
  statusKey: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'EMPTY';
  occupancyKey: 'LIVRE' | 'OCUPADA' | 'EM_PREPARO' | 'PRONTA' | 'FINALIZANDO' | 'CANCELADA';
  activeOrdersCount: number;
  totalAmount: number;
  totalOpenAmount: number;
  averageTicket: number;
};

function tableLabel(table: { number?: string | null; name: string }) {
  return table.number != null && String(table.number).trim() !== ''
    ? `Mesa ${table.number}`
    : table.name;
}

function orderCode(order: Order) {
  return order.code ?? order.orderNumber ?? order.id.slice(0, 8);
}

function normalizeStatusKey(status: string): TableSummary['statusKey'] {
  const s = String(status ?? '').toUpperCase();
  if (s === 'READY') return 'READY';
  if (s === 'PREPARING') return 'PREPARING';
  if (s === 'CONFIRMED' || s === 'PENDING') return 'PENDING';
  if (s === 'COMPLETED' || s === 'DELIVERED' || s === 'OUT_FOR_DELIVERY') return 'COMPLETED';
  if (s === 'CANCELLED') return 'COMPLETED';
  return 'PENDING';
}

function statusBadge(statusKey: TableSummary['statusKey']) {
  if (statusKey === 'EMPTY') return { label: 'Sem pedidos', variant: 'default' as const };
  if (statusKey === 'READY') return { label: 'Pronto', variant: 'success' as const };
  if (statusKey === 'PREPARING') return { label: 'Em preparo', variant: 'warning' as const };
  if (statusKey === 'PENDING') return { label: 'Pendente', variant: 'error' as const };
  return { label: 'Finalizado', variant: 'default' as const };
}

function isOrderActive(status: string): boolean {
  const s = String(status ?? '').toUpperCase();
  return s !== 'COMPLETED' && s !== 'DELIVERED' && s !== 'CANCELLED';
}

function occupancyBadge(occupancyKey: TableSummary['occupancyKey']) {
  switch (occupancyKey) {
    case 'PRONTA':
      return { label: 'Pronta', variant: 'success' as const };
    case 'EM_PREPARO':
      return { label: 'Em preparo', variant: 'warning' as const };
    case 'OCUPADA':
      return { label: 'Ocupada', variant: 'error' as const };
    case 'FINALIZANDO':
      return { label: 'Finalizando', variant: 'default' as const };
    case 'CANCELADA':
      return { label: 'Cancelada', variant: 'default' as const };
    default:
      return { label: 'Livre', variant: 'default' as const };
  }
}

function compactOrderStatus(status: string) {
  const key = normalizeStatusKey(status);
  const b = statusBadge(key);
  return { label: b.label, variant: b.variant };
}

export default function SalonPage() {
  const { user } = useAuth();
  const establishmentId = user?.establishmentId ?? null;
  const canView = user ? canAccessSalon(user.role) : false;

  const { orders, loading: loadingOrders, refetch: refetchOrders } = useOrders(establishmentId ?? undefined);
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<TableSummary | null>(null);
  const [openSessionByTableId, setOpenSessionByTableId] = useState<Record<string, { id: string } | null>>({});
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [closingTableId, setClosingTableId] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [closeSuccessTotal, setCloseSuccessTotal] = useState<number | null>(null);
  const [lastClosedTotalByTableId, setLastClosedTotalByTableId] = useState<Record<string, number>>({});
  const [sessionHistory, setSessionHistory] = useState<TableSessionHistoryItem[]>([]);
  const [sessionHistoryLoading, setSessionHistoryLoading] = useState(false);
  const [salonStats, setSalonStats] = useState<SalonStatsToday | null>(null);
  const [accountFee, setAccountFee] = useState<string>('');
  const [accountDiscount, setAccountDiscount] = useState<string>('');
  const [accountUpdateLoading, setAccountUpdateLoading] = useState(false);
  const [accountUpdateSuccess, setAccountUpdateSuccess] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixQr, setPixQr] = useState<CreateSessionPixResponse | null>(null);
  const [pixWaiting, setPixWaiting] = useState(false);
  const [pixSuccess, setPixSuccess] = useState(false);
  const pixPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (!establishmentId || !canView) {
      setLoadingTables(false);
      return;
    }
    getEstablishmentTables(establishmentId)
      .then((t) => setTables(t ?? []))
      .finally(() => setLoadingTables(false));
  }, [establishmentId, canView]);

  useEffect(() => {
    if (!canView || !establishmentId) return;
    setSessionsLoaded(false);
    let cancelled = false;
    getOpenSessionsByEstablishment(establishmentId).then((data) => {
      if (cancelled) return;
      setOpenSessionByTableId((prev) => {
        const next = { ...prev };
        for (const item of data) next[item.tableId] = item.session;
        return next;
      });
      setSessionsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [canView, establishmentId]);

  useEffect(() => {
    if (!canView || !establishmentId) return;
    getSalonStatsToday(establishmentId)
      .then(setSalonStats)
      .catch(() => setSalonStats(null));
  }, [canView, establishmentId]);

  useEffect(() => {
    if (closeSuccessTotal === null) return;
    const t = setTimeout(() => {
      setSelectedSummary(null);
      setCloseSuccessTotal(null);
    }, 2200);
    return () => clearTimeout(t);
  }, [closeSuccessTotal]);

  useEffect(() => {
    if (!selectedSummary?.table.id) {
      setSessionHistory([]);
      if (pixPollRef.current) clearInterval(pixPollRef.current);
      pixPollRef.current = null;
      setPixLoading(false);
      setPixError(null);
      setPixQr(null);
      setPixWaiting(false);
      setPixSuccess(false);
      return;
    }
    setSessionHistoryLoading(true);
    setSessionHistory([]);
    setAccountUpdateSuccess(false);
    setPaySuccess(false);
    if (pixPollRef.current) clearInterval(pixPollRef.current);
    pixPollRef.current = null;
    setPixLoading(false);
    setPixError(null);
    setPixQr(null);
    setPixWaiting(false);
    setPixSuccess(false);
    getSessionsByTable(selectedSummary.table.id)
      .then((data) => {
        setSessionHistory(data ?? []);
        const first = data?.[0];
        if (first) {
          setAccountFee(first.serviceFeeAmount != null ? String(first.serviceFeeAmount) : '');
          setAccountDiscount(first.discountAmount != null ? String(first.discountAmount) : '');
        } else {
          setAccountFee('');
          setAccountDiscount('');
        }
      })
      .catch(() => setSessionHistory([]))
      .finally(() => setSessionHistoryLoading(false));
  }, [selectedSummary?.table.id]);

  const loading = loadingOrders || loadingTables || (tables.length > 0 && !sessionsLoaded);

  const summaries = useMemo<TableSummary[]>(() => {
    const ordersWithTable = (orders ?? []).filter((o) => o.table?.id);
    const byTableId = new Map<string, Order[]>();
    for (const o of ordersWithTable) {
      const tableId = o.table!.id;
      const list = byTableId.get(tableId) ?? [];
      list.push(o);
      byTableId.set(tableId, list);
    }

    const tableById = new Map<string, Table>();
    for (const t of tables ?? []) tableById.set(t.id, t);

    const allTableIds = new Set<string>([...Array.from(tableById.keys()), ...Array.from(byTableId.keys())]);

    const result: TableSummary[] = [];
    for (const tableId of Array.from(allTableIds.values())) {
      const table = tableById.get(tableId) ?? {
        id: tableId,
        name: 'Mesa',
        number: null,
        token: null,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      };
      const list = (byTableId.get(tableId) ?? []).slice();
      list.sort((a, b) => {
        const da = new Date(a.createdAt as unknown as string).getTime();
        const db = new Date(b.createdAt as unknown as string).getTime();
        return db - da;
      });
      const lastOrder = list[0] ?? null;
      const recentOrders = list.slice(0, 3);

      const statusKey: TableSummary['statusKey'] = lastOrder ? normalizeStatusKey(lastOrder.status) : 'EMPTY';

      const activeOrders = list.filter((o) => isOrderActive(o.status));
      const activeOrdersCount = activeOrders.length;

      const occupancyKey: TableSummary['occupancyKey'] = (() => {
        if (!lastOrder) return 'LIVRE';

        const lastStatus = String(lastOrder.status ?? '').toUpperCase();
        if (lastStatus === 'READY') return 'PRONTA';
        if (lastStatus === 'PREPARING') return 'EM_PREPARO';
        if (activeOrdersCount > 0) return 'OCUPADA';
        if (lastStatus === 'CANCELLED') return 'CANCELADA';
        if (lastStatus === 'OUT_FOR_DELIVERY' || lastStatus === 'COMPLETED' || lastStatus === 'DELIVERED') {
          return 'FINALIZANDO';
        }
        return 'LIVRE';
      })();

      const totalOpenAmount = list.reduce((acc, o) => {
        if (!isOrderActive(o.status)) return acc;
        return acc + Number(o.total ?? 0);
      }, 0);

      const totalAmount = list.reduce((acc, o) => acc + Number(o.total ?? 0), 0);
      const averageTicket = list.length > 0 ? totalAmount / list.length : 0;

      result.push({
        table,
        orders: list,
        recentOrders,
        lastOrder,
        statusKey,
        occupancyKey,
        activeOrdersCount,
        totalAmount,
        totalOpenAmount,
        averageTicket,
      });
    }

    // Ordena: primeiro mesas com pedidos, depois vazias; e por recência
    result.sort((a, b) => {
      const aHas = a.lastOrder ? 1 : 0;
      const bHas = b.lastOrder ? 1 : 0;
      if (aHas !== bHas) return bHas - aHas;
      const da = a.lastOrder ? new Date(a.lastOrder.createdAt as unknown as string).getTime() : 0;
      const db = b.lastOrder ? new Date(b.lastOrder.createdAt as unknown as string).getTime() : 0;
      return db - da;
    });

    return result;
  }, [orders, tables]);

  if (!user) return null;
  if (!canView) return <AccessDenied description="Seu perfil não pode acessar esta área." />;
  if (!establishmentId) return <AccessDenied description="Usuário sem estabelecimento vinculado." />;
  if (loading) return <LoadingPage />;

  const stats = salonStats ?? {
    sessionsToday: 0,
    revenueToday: 0,
    activeTablesCount: 0,
    averageTicket: null as number | null,
    paidSessionsToday: 0,
    pendingPaymentSessionsToday: 0,
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Resumo do dia</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
            <div className="text-xs font-medium text-gray-500">Faturamento hoje</div>
            <div className="mt-0.5 text-base font-semibold text-gray-900">
              {formatCurrency(stats.revenueToday)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
            <div className="text-xs font-medium text-gray-500">Mesas ativas</div>
            <div className="mt-0.5 text-base font-semibold text-gray-900">
              {stats.activeTablesCount}
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
            <div className="text-xs font-medium text-gray-500">Sessões hoje</div>
            <div className="mt-0.5 text-base font-semibold text-gray-900">
              {stats.sessionsToday}
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
            <div className="text-xs font-medium text-gray-500">Ticket médio</div>
            <div className="mt-0.5 text-base font-semibold text-gray-900">
              {stats.averageTicket != null ? formatCurrency(stats.averageTicket) : '—'}
            </div>
          </div>
          <div className="rounded-lg border border-green-100 bg-green-50/50 px-3 py-2.5">
            <div className="text-xs font-medium text-gray-500">Sessões pagas</div>
            <div className="mt-0.5 text-base font-semibold text-gray-900">
              {stats.paidSessionsToday ?? 0}
            </div>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2.5">
            <div className="text-xs font-medium text-gray-500">Sessões pendentes</div>
            <div className="mt-0.5 text-base font-semibold text-gray-900">
              {stats.pendingPaymentSessionsToday ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salão (por mesa)</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visão operacional agrupada por mesa, usando os pedidos existentes.
          </p>
        </div>
        <Link href="/orders">
          <Button variant="outline">Ver pedidos</Button>
        </Link>
      </div>

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 py-12 text-center text-gray-500">
          Nenhuma mesa encontrada.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaries.map((s) => {
            const badge = statusBadge(s.statusKey);
            const occ = occupancyBadge(s.occupancyKey);
            const label = tableLabel(s.table);
            const isClosed =
              s.table.id in openSessionByTableId && openSessionByTableId[s.table.id] === null;
            return (
              <article
                key={s.table.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  isClosed
                    ? 'border-gray-200 bg-gray-50/50'
                    : s.occupancyKey === 'PRONTA'
                      ? 'border-emerald-200'
                      : s.occupancyKey === 'EM_PREPARO'
                        ? 'border-amber-200'
                        : s.occupancyKey === 'OCUPADA'
                          ? 'border-rose-200'
                          : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-gray-900">{label}</div>
                    <div className="mt-1 text-sm text-gray-500">
                      {s.orders.length > 0 ? `${s.orders.length} pedido(s)` : 'Sem pedidos'}
                      {!isClosed && s.activeOrdersCount > 0 ? ` · ${s.activeOrdersCount} ativo(s)` : ''}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isClosed ? (
                      <Badge variant="default">Encerrada</Badge>
                    ) : (
                      <>
                        <Badge variant={occ.variant}>{occ.label}</Badge>
                        {s.lastOrder && (
                          <span className="text-xs text-gray-500">Último: {badge.label}</span>
                        )}
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => setSelectedSummary(s)}
                    >
                      Ver mesa
                    </Button>
                  </div>
                </div>

                {s.lastOrder ? (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">Último:</span> #{orderCode(s.lastOrder)} ·{' '}
                      {formatDateTime(s.lastOrder.createdAt)}
                    </div>
                    {s.totalOpenAmount > 0 && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Em aberto:</span>{' '}
                        {formatCurrency(s.totalOpenAmount)}
                      </div>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">Total da mesa</div>
                        <div className="mt-0.5 text-sm font-semibold text-gray-900">
                          {formatCurrency(s.totalAmount)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">Em aberto</div>
                        <div className="mt-0.5 text-sm font-semibold text-gray-900">
                          {formatCurrency(s.totalOpenAmount)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">Pedidos</div>
                        <div className="mt-0.5 text-sm font-semibold text-gray-900">
                          {s.orders.length}
                          {!isClosed && s.activeOrdersCount > 0 ? (
                            <span className="ml-1 text-xs font-medium text-gray-500">
                              ({s.activeOrdersCount} ativos)
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">Ticket médio</div>
                        <div className="mt-0.5 text-sm font-semibold text-gray-900">
                          {formatCurrency(s.averageTicket)}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Últimos pedidos</span>
                        <Link href="/orders">
                          <Button size="sm" variant="ghost">Ver todos</Button>
                        </Link>
                      </div>
                      <ul className="space-y-2">
                        {s.recentOrders.map((o) => {
                          const st = compactOrderStatus(o.status);
                          return (
                            <li key={o.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Link href={`/orders/${o.id}`} className="font-mono text-sm font-semibold text-gray-900 hover:underline">
                                      #{orderCode(o)}
                                    </Link>
                                    <Badge variant={st.variant}>{st.label}</Badge>
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500">
                                    {formatDateTime(o.createdAt)}
                                  </div>
                                </div>
                                <div className="shrink-0 text-sm font-semibold text-gray-900">
                                  {formatCurrency(Number(o.total ?? 0))}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                    Sem pedidos recentes nesta mesa.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={!!selectedSummary}
        onClose={() => setSelectedSummary(null)}
        title={selectedSummary ? tableLabel(selectedSummary.table) : ''}
        className="max-w-2xl"
      >
        {selectedSummary && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={occupancyBadge(selectedSummary.occupancyKey).variant}>
                {occupancyBadge(selectedSummary.occupancyKey).label}
              </Badge>
              <span className="text-sm text-gray-500">
                {selectedSummary.orders.length} pedido(s)
                {selectedSummary.activeOrdersCount > 0 ? ` · ${selectedSummary.activeOrdersCount} ativo(s)` : ''}
              </span>
            </div>

            {lastClosedTotalByTableId[selectedSummary.table.id] != null && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                <div className="text-xs font-medium text-emerald-700">Último fechamento</div>
                <div className="mt-0.5 text-base font-semibold text-emerald-900">
                  {formatCurrency(lastClosedTotalByTableId[selectedSummary.table.id])}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                <div className="text-xs font-medium text-gray-500">Total da mesa</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(selectedSummary.totalAmount)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                <div className="text-xs font-medium text-gray-500">Em aberto</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(selectedSummary.totalOpenAmount)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                <div className="text-xs font-medium text-gray-500">Pedidos</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {selectedSummary.orders.length}
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                <div className="text-xs font-medium text-gray-500">Ticket médio</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(selectedSummary.averageTicket)}
                </div>
              </div>
            </div>

            {sessionHistory.length > 0 && (() => {
              const withTotal = sessionHistory.filter((s) => s.totalAmount != null && Number(s.totalAmount) >= 0);
              const totalRevenue = withTotal.reduce((acc, s) => acc + Number(s.totalAmount ?? 0), 0);
              const lastClosed = sessionHistory.find((s) => s.totalAmount != null);
              const lastClosedTotal = lastClosed != null ? Number(lastClosed.totalAmount) : null;
              const sessionsWithValue = withTotal.length;
              const averageSession = sessionsWithValue > 0 ? totalRevenue / sessionsWithValue : null;
              return (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">Resumo financeiro</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3">
                      <div className="text-xs font-medium text-gray-500">Sessões</div>
                      <div className="mt-0.5 text-sm font-semibold text-gray-900">{sessionHistory.length}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3">
                      <div className="text-xs font-medium text-gray-500">Faturamento</div>
                      <div className="mt-0.5 text-sm font-semibold text-gray-900">{formatCurrency(totalRevenue)}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3">
                      <div className="text-xs font-medium text-gray-500">Último fechamento</div>
                      <div className="mt-0.5 text-sm font-semibold text-gray-900">
                        {lastClosedTotal != null ? formatCurrency(lastClosedTotal) : '—'}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3">
                      <div className="text-xs font-medium text-gray-500">Ticket médio/sessão</div>
                      <div className="mt-0.5 text-sm font-semibold text-gray-900">
                        {averageSession != null ? formatCurrency(averageSession) : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {sessionHistory.length > 0 && (() => {
              const s = sessionHistory[0];
              const totalAmount = s.totalAmount != null ? Number(s.totalAmount) : 0;
              const serviceFee = s.serviceFeeAmount != null ? Number(s.serviceFeeAmount) : 0;
              const discount = s.discountAmount != null ? Number(s.discountAmount) : 0;
              const finalAmount = s.finalAmount != null ? Number(s.finalAmount) : totalAmount + serviceFee - discount;
              const isClosed = s.status === 'CLOSED';
              const isPending = (s.paymentStatus ?? 'PENDING') === 'PENDING';
              return (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Conta da sessão</h3>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxa de serviço</span>
                      <span className="font-medium text-gray-900">{formatCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Desconto</span>
                      <span className="font-medium text-gray-900">{formatCurrency(discount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
                      <span className="font-semibold text-gray-900">Total final</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(finalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs text-gray-500">Status de pagamento</span>
                      <Badge variant={isPending ? 'default' : 'success'}>
                        {isPending ? 'Pendente' : 'Pago'}
                      </Badge>
                    </div>
                  </div>
                  {isPending && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Taxa de serviço (R$)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        value={accountFee}
                        onChange={(e) => setAccountFee(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Desconto (R$)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        value={accountDiscount}
                        onChange={(e) => setAccountDiscount(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {isPending && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={accountUpdateLoading}
                      disabled={accountUpdateLoading}
                      onClick={async () => {
                        setAccountUpdateLoading(true);
                        setAccountUpdateSuccess(false);
                        try {
                          await updateSessionAccount(s.id, {
                            serviceFeeAmount: Number(accountFee) || 0,
                            discountAmount: Number(accountDiscount) || 0,
                          });
                          setAccountUpdateSuccess(true);
                          const data = await getSessionsByTable(selectedSummary.table.id);
                          setSessionHistory(data ?? []);
                          if (establishmentId) getSalonStatsToday(establishmentId).then(setSalonStats).catch(() => {});
                          setTimeout(() => setAccountUpdateSuccess(false), 3000);
                        } catch {
                          // erro silencioso ou toast
                        } finally {
                          setAccountUpdateLoading(false);
                        }
                      }}
                    >
                      Salvar ajustes
                    </Button>
                    )}
                    {accountUpdateSuccess && (
                      <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
                        Conta atualizada
                      </span>
                    )}
                    {isClosed && isPending && (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={pixLoading}
                            disabled={pixLoading}
                            onClick={async () => {
                              if (!selectedSummary) return;
                              setPixLoading(true);
                              setPixError(null);
                              setPixSuccess(false);
                              setPixWaiting(true);
                              setPixQr(null);
                              try {
                                const resp = await createSessionPix(s.id);
                                setPixQr(resp);

                                if (pixPollRef.current) clearInterval(pixPollRef.current);
                                const tableId = selectedSummary.table.id;
                                const poll = setInterval(async () => {
                                  try {
                                    const data = await getSessionsByTable(tableId);
                                    setSessionHistory(data ?? []);
                                    const current = (data ?? []).find((x) => x.id === s.id);
                                    const paid = (current?.paymentStatus ?? 'PENDING') === 'PAID';
                                    if (paid) {
                                      setPixWaiting(false);
                                      setPixSuccess(true);
                                      if (establishmentId) {
                                        getSalonStatsToday(establishmentId)
                                          .then(setSalonStats)
                                          .catch(() => {});
                                      }
                                      clearInterval(poll);
                                      pixPollRef.current = null;
                                      setTimeout(() => setPixSuccess(false), 3000);
                                    }
                                  } catch {
                                    // ignora erro transitório no polling
                                  }
                                }, 3000);
                                pixPollRef.current = poll;
                              } catch (err) {
                                setPixError((err as Error)?.message ?? 'Erro ao gerar PIX');
                                setPixWaiting(false);
                              } finally {
                                setPixLoading(false);
                              }
                            }}
                          >
                            Pagar com PIX
                          </Button>

                          <Button
                            size="sm"
                            variant="primary"
                            loading={payLoading}
                            disabled={payLoading}
                            onClick={async () => {
                              if (pixPollRef.current) {
                                clearInterval(pixPollRef.current);
                                pixPollRef.current = null;
                              }
                              setPayLoading(true);
                              setPaySuccess(false);
                              setPixWaiting(false);
                              try {
                                await markSessionAsPaid(s.id);
                                setPaySuccess(true);
                                const data = await getSessionsByTable(selectedSummary.table.id);
                                setSessionHistory(data ?? []);
                                if (establishmentId) {
                                  getSalonStatsToday(establishmentId)
                                    .then(setSalonStats)
                                    .catch(() => {});
                                }
                                setTimeout(() => setPaySuccess(false), 3000);
                              } catch {
                                // erro
                              } finally {
                                setPayLoading(false);
                              }
                            }}
                          >
                            Marcar como pago
                          </Button>
                        </div>

                        {pixWaiting && !pixSuccess && (
                          <span className="mt-2 block rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">
                            Aguardando confirmação do pagamento…
                          </span>
                        )}
                        {pixError && (
                          <span className="mt-2 block rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
                            {pixError}
                          </span>
                        )}
                        {pixSuccess && (
                          <span className="mt-2 block rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
                            PIX confirmado: sessão paga
                          </span>
                        )}

                        {pixQr && (
                          <div className="mt-3 space-y-2 rounded-xl border border-gray-200 bg-white p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-medium text-gray-700">PIX - QR Code</p>
                              {pixQr.qrCode && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(pixQr.qrCode ?? '');
                                    } catch {
                                      // ignore
                                    }
                                  }}
                                >
                                  Copiar código
                                </Button>
                              )}
                            </div>
                            {pixQr.qrCodeBase64 && (
                              <img
                                className="mx-auto h-44 w-44 rounded-lg bg-white"
                                src={`data:image/png;base64,${pixQr.qrCodeBase64}`}
                                alt="QR Code PIX"
                              />
                            )}
                            {pixQr.qrCode && (
                              <p className="break-all text-xs text-gray-600">{pixQr.qrCode}</p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {paySuccess && (
                      <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
                        Sessão marcada como paga
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowReceipt(true)}
                    >
                      Ver comprovante
                    </Button>
                  </div>
                </div>
              );
            })()}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Pedidos da mesa</h3>
              {selectedSummary.orders.length === 0 ? (
                <p className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  Nenhum pedido nesta mesa.
                </p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-gray-100">
                  {selectedSummary.orders.map((o) => {
                    const st = compactOrderStatus(o.status);
                    return (
                      <li key={o.id} className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/orders/${o.id}`}
                              className="font-mono text-sm font-semibold text-gray-900 hover:underline"
                            >
                              #{orderCode(o)}
                            </Link>
                            <Badge variant={st.variant}>{st.label}</Badge>
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            {formatDateTime(o.createdAt)}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(Number(o.total ?? 0))}
                          </span>
                          <Link href={`/orders/${o.id}`}>
                            <Button size="sm" variant="ghost">
                              Abrir
                            </Button>
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Histórico de sessões</h3>
              {sessionHistoryLoading ? (
                <p className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                  Carregando…
                </p>
              ) : sessionHistory.length === 0 ? (
                <p className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  Nenhuma sessão registrada.
                </p>
              ) : (
                <ul className="space-y-1.5 rounded-xl border border-gray-100">
                  {sessionHistory.slice(0, 5).map((s) => {
                    const payStatus = (s.paymentStatus ?? 'PENDING') === 'PAID' ? 'Pago' : 'Pendente';
                    return (
                      <li
                        key={s.id}
                        className="border-b border-gray-100 px-3 py-2 last:border-b-0 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 text-xs text-gray-600">
                            <span className="font-medium text-gray-900">
                              {formatDateTime(s.openedAt)}
                            </span>
                            {s.closedAt != null && (
                              <span className="ml-1">→ {formatDateTime(s.closedAt)}</span>
                            )}
                          </div>
                          <Badge variant={payStatus === 'Pago' ? 'success' : 'default'}>{payStatus}</Badge>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Subtotal: {s.totalAmount != null ? formatCurrency(Number(s.totalAmount)) : '—'}</span>
                          <span>Final: {s.finalAmount != null ? formatCurrency(Number(s.finalAmount)) : '—'}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 border-t border-gray-100 pt-4">
              {closeError && (
                <p className="w-full text-sm text-red-600">{closeError}</p>
              )}
              {closeSuccessTotal !== null ? (
                <p className="w-full rounded-lg bg-emerald-50 py-3 text-center text-sm font-medium text-emerald-800">
                  Mesa encerrada com total de {formatCurrency(closeSuccessTotal)}
                </p>
              ) : (
              <Button
                variant="danger"
                loading={closingTableId === selectedSummary?.table.id}
                disabled={!!closingTableId}
                onClick={async () => {
                  if (!selectedSummary) return;
                  const tableId = selectedSummary.table.id;
                  setClosingTableId(tableId);
                  setCloseError(null);
                  try {
                    const result = await closeTableSession(tableId);
                    if (result.closed) {
                      const total =
                        result.session?.totalAmount != null
                          ? Number(result.session.totalAmount)
                          : null;
                      setOpenSessionByTableId((prev) => ({ ...prev, [tableId]: null }));
                      if (total != null) {
                        setLastClosedTotalByTableId((prev) => ({ ...prev, [tableId]: total }));
                      }
                      setCloseSuccessTotal(total);
                      await refetchOrders();
                      getSessionsByTable(tableId).then((data) => setSessionHistory(data ?? []));
                      if (establishmentId) {
                        getSalonStatsToday(establishmentId).then(setSalonStats).catch(() => {});
                      }
                    } else {
                      setCloseError(result.message ?? 'Nenhuma sessão aberta para esta mesa.');
                    }
                  } catch (err) {
                    setCloseError((err as Error).message ?? 'Erro ao encerrar mesa');
                  } finally {
                    setClosingTableId(null);
                  }
                }}
              >
                Encerrar mesa
              </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {showReceipt && selectedSummary && sessionHistory.length > 0 && (() => {
        const s = sessionHistory[0];
        const totalAmount = s.totalAmount != null ? Number(s.totalAmount) : 0;
        const serviceFee = s.serviceFeeAmount != null ? Number(s.serviceFeeAmount) : 0;
        const discount = s.discountAmount != null ? Number(s.discountAmount) : 0;
        const finalAmount = s.finalAmount != null ? Number(s.finalAmount) : totalAmount + serviceFee - discount;
        const paid = (s.paymentStatus ?? 'PENDING') === 'PAID';
        const dateTime = s.closedAt ?? s.openedAt;
        return (
          <Modal
            open
            onClose={() => setShowReceipt(false)}
            title="Comprovante"
            className="max-w-md"
          >
            <div
              id="comprovante-print"
              className="rounded-2xl border border-gray-200 bg-white p-6 text-center space-y-4 print:p-8"
            >
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">COMPROVANTE DE CONTA</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{tableLabel(selectedSummary.table)}</p>
                <p>{formatDateTime(dateTime)}</p>
              </div>
              <div className="border-t border-b border-gray-200 py-3 space-y-2 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de serviço</span>
                  <span className="font-medium">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Desconto</span>
                  <span className="font-medium">{formatCurrency(discount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 font-semibold text-gray-900">
                  <span>Total final</span>
                  <span>{formatCurrency(finalAmount)}</span>
                </div>
              </div>
              <p className="text-sm">
                Status:{' '}
                <span
                  className={
                    paid
                      ? 'rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800'
                      : 'rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800'
                  }
                >
                  {paid ? 'PAGO' : 'PENDENTE'}
                </span>
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2 print:hidden">
              <Button variant="outline" onClick={() => setShowReceipt(false)}>Fechar</Button>
              <Button variant="primary" onClick={() => window.print()}>Imprimir</Button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

