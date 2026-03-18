'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import {
  getReportToday,
  getCashierSummary,
  getReportRange,
} from '@/services/table-session.service';
import type { CashierSummaryResponse, ReportRangeResponse } from '@/services/table-session.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';

type PeriodPreset = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

function getTodaySP(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

function getDateRangeSP(preset: PeriodPreset, customFrom?: string, customTo?: string): { from: string; to: string } {
  const today = getTodaySP();
  if (preset === 'custom' && customFrom && customTo) return { from: customFrom, to: customTo };
  if (preset === 'today') return { from: today, to: today };
  const [y, m, d] = today.split('-').map(Number);
  const addDays = (days: number) => {
    const date = new Date(y, m - 1, d + days);
    return date.toISOString().slice(0, 10);
  };
  if (preset === 'yesterday') {
    const yesterday = addDays(-1);
    return { from: yesterday, to: yesterday };
  }
  if (preset === '7d') return { from: addDays(-6), to: today };
  if (preset === '30d') return { from: addDays(-29), to: today };
  return { from: today, to: today };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const establishmentId = user?.establishmentId ?? '';
  const reports = useReports(establishmentId);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [summary, setSummary] = useState<{ total: number; count: number } | null>(null);
  const [top, setTop] = useState<{ name: string; quantity: number; total: number }[]>([]);
  const [methods, setMethods] = useState<Record<string, number>>({});
  const [cashier, setCashier] = useState<CashierSummaryResponse | null>(null);
  const [reportRange, setReportRange] = useState<ReportRangeResponse | null>(null);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [rangeLoading, setRangeLoading] = useState(false);

  useEffect(() => {
    if (!establishmentId) return;
    getCashierSummary(establishmentId).then(setCashier).catch(() => setCashier(null));
  }, [establishmentId]);

  const fetchReportForPeriod = useCallback(async () => {
    if (!establishmentId) return;
    if (periodPreset === 'today') {
      setRangeLoading(true);
      try {
        const data = await getReportToday(establishmentId);
        setReportRange({
          revenue: data.revenueToday,
          paidRevenue: data.revenueToday,
          pendingRevenue: 0,
          sessionsCount: data.sessionsCount,
          paidSessions: data.paidSessions,
          pendingSessions: data.pendingSessions,
          averageTicket: data.averageTicket ?? null,
          tableRanking: data.tableRanking.map((r) => ({
            tableId: r.tableId,
            tableName: r.tableName,
            totalRevenue: r.totalRevenue,
            paidRevenue: r.paidRevenue ?? r.totalRevenue,
            sessionsCount: r.sessionsCount,
            averageTicket: r.averageTicket ?? (r.sessionsCount ? r.totalRevenue / r.sessionsCount : 0),
          })),
        });
      } finally {
        setRangeLoading(false);
      }
      return;
    }
    const { from, to } = getDateRangeSP(periodPreset, customFrom, customTo);
    setRangeLoading(true);
    try {
      const data = await getReportRange(establishmentId, from, to);
      setReportRange(data);
    } catch {
      setReportRange(null);
    } finally {
      setRangeLoading(false);
    }
  }, [establishmentId, periodPreset, customFrom, customTo]);

  useEffect(() => {
    if (!establishmentId || periodPreset === 'custom') return;
    fetchReportForPeriod();
  }, [establishmentId, periodPreset, fetchReportForPeriod]);

  const run = async () => {
    if (!start || !end) return;
    try {
      const [s, t, m] = await Promise.all([
        reports.fetchSalesSummary(start, end),
        reports.fetchTopProducts(start, end, 10),
        reports.fetchPaymentMethods(start, end),
      ]);
      setSummary(s);
      setTop(t);
      setMethods(m ?? {});
    } catch {
      // ignore
    }
  };

  const periodLabel =
    periodPreset === 'today'
      ? 'Hoje'
      : periodPreset === 'yesterday'
        ? 'Ontem'
        : periodPreset === '7d'
          ? 'Últimos 7 dias'
          : periodPreset === '30d'
            ? 'Últimos 30 dias'
            : 'Período';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>

      {cashier && (
        <Card>
          <CardContent className="pt-4">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Fechamento de caixa</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-lg border border-green-200 bg-green-50/80 px-3 py-2.5">
                <div className="text-xs font-medium text-green-700">Pago hoje</div>
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(cashier.paidRevenueToday)}</div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2.5">
                <div className="text-xs font-medium text-amber-700">Pendente hoje</div>
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(cashier.pendingRevenueToday)}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5">
                <div className="text-xs font-medium text-gray-600">Sessões fechadas</div>
                <div className="text-sm font-semibold text-gray-900">{cashier.closedSessionsToday}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5">
                <div className="text-xs font-medium text-gray-600">Sessões abertas</div>
                <div className="text-sm font-semibold text-gray-900">{cashier.openSessionsNow}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5">
                <div className="text-xs font-medium text-gray-600">Ticket médio pago</div>
                <div className="text-sm font-semibold text-gray-900">
                  {cashier.averagePaidTicketToday != null ? formatCurrency(cashier.averagePaidTicketToday) : '—'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Salão — {periodLabel}</h2>
            <div className="flex flex-wrap items-center gap-2">
              {(['today', 'yesterday', '7d', '30d'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriodPreset(p)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    periodPreset === p
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p === 'today' ? 'Hoje' : p === 'yesterday' ? 'Ontem' : p === '7d' ? '7 dias' : '30 dias'}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPeriodPreset('custom')}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  periodPreset === 'custom'
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Custom
              </button>
              {periodPreset === 'custom' && (
                <>
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-36"
                  />
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-36"
                  />
                  <Button size="sm" onClick={fetchReportForPeriod} loading={rangeLoading}>
                    Aplicar
                  </Button>
                </>
              )}
            </div>
          </div>
          {rangeLoading && !reportRange && (
            <p className="text-sm text-gray-500">Carregando…</p>
          )}
          {reportRange && !rangeLoading && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-4">
                <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                  <div className="text-xs font-medium text-gray-500">Faturamento</div>
                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(reportRange.revenue)}</div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                  <div className="text-xs font-medium text-gray-500">Sessões</div>
                  <div className="text-sm font-semibold text-gray-900">{reportRange.sessionsCount}</div>
                </div>
                <div className="rounded-lg border border-green-100 bg-green-50/50 px-3 py-2">
                  <div className="text-xs font-medium text-gray-500">Pagas</div>
                  <div className="text-sm font-semibold text-gray-900">{reportRange.paidSessions}</div>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2">
                  <div className="text-xs font-medium text-gray-500">Pendentes</div>
                  <div className="text-sm font-semibold text-gray-900">{reportRange.pendingSessions}</div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                  <div className="text-xs font-medium text-gray-500">Ticket médio</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {reportRange.averageTicket != null ? formatCurrency(reportRange.averageTicket) : '—'}
                  </div>
                </div>
              </div>
              {reportRange.tableRanking.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Ranking de mesas</h3>
                  <ul className="space-y-2 rounded-lg border border-gray-100">
                    {reportRange.tableRanking.map((row, i) => {
                      const maxRevenue = Math.max(...reportRange.tableRanking.map((r) => r.totalRevenue), 0);
                      const maxSessions = Math.max(...reportRange.tableRanking.map((r) => r.sessionsCount), 0);
                      const badgeRevenue = maxRevenue > 0 && row.totalRevenue === maxRevenue;
                      const badgeSessions = maxSessions > 0 && row.sessionsCount === maxSessions;
                      return (
                        <li
                          key={row.tableId}
                          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {i + 1}. {row.tableName}
                            {(badgeRevenue || badgeSessions) && (
                              <span className="ml-2 inline-flex flex-wrap gap-1">
                                {badgeRevenue && (
                                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800">
                                    maior faturamento
                                  </span>
                                )}
                                {badgeSessions && (
                                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                                    maior uso
                                  </span>
                                )}
                              </span>
                            )}
                          </span>
                          <span className="text-sm text-gray-600">
                            {row.sessionsCount} sessão(ões) · {formatCurrency(row.totalRevenue)}
                            {row.averageTicket != null && row.averageTicket > 0 && (
                              <> · ticket {formatCurrency(row.averageTicket)}</>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Input label="Início" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="Fim" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            <Button onClick={run} loading={reports.loading}>Gerar</Button>
          </div>
        </CardContent>
      </Card>
      {summary && (
        <Card>
          <CardContent className="pt-4">
            <p className="font-semibold">Total: {formatCurrency(summary.total)}</p>
            <p className="text-sm text-gray-500">Pedidos: {summary.count}</p>
          </CardContent>
        </Card>
      )}
      {Object.keys(methods).length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h2 className="font-semibold">Por pagamento</h2>
            {Object.entries(methods).map(([k, v]) => (
              <p key={k} className="text-sm">{k}: {formatCurrency(v)}</p>
            ))}
          </CardContent>
        </Card>
      )}
      {top.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h2 className="font-semibold">Top produtos</h2>
            {top.map((p) => (
              <p key={p.name} className="text-sm">{p.name}: {p.quantity} un - {formatCurrency(p.total)}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
