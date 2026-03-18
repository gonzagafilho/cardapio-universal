import { apiGet, apiPatch, apiPost } from './api';

export interface ClosedSessionSession {
  id: string;
  totalAmount?: string | number | null;
  [key: string]: unknown;
}

export interface CloseTableSessionResult {
  closed: boolean;
  message?: string;
  session?: ClosedSessionSession;
}

export interface OpenSessionResponse {
  open: boolean;
  session: { id: string } | null;
}

export type OpenSessionByEstablishmentItem = {
  tableId: string;
  session: { id: string } | null;
};

export interface SalonStatsToday {
  sessionsToday: number;
  revenueToday: number;
  activeTablesCount: number;
  averageTicket: number | null;
  paidSessionsToday?: number;
  pendingPaymentSessionsToday?: number;
}

export async function getSalonStatsToday(
  establishmentId: string,
): Promise<SalonStatsToday> {
  return apiGet<SalonStatsToday>(
    `/table-sessions/stats-today/${encodeURIComponent(establishmentId)}`,
  );
}

export async function getOpenSessionsByEstablishment(
  establishmentId: string,
): Promise<OpenSessionByEstablishmentItem[]> {
  return apiGet<OpenSessionByEstablishmentItem[]>(
    `/table-sessions/by-establishment/${encodeURIComponent(establishmentId)}`,
  );
}

export interface TableSessionHistoryItem {
  id: string;
  openedAt: string;
  closedAt: string | null;
  totalAmount: string | number | null;
  serviceFeeAmount?: string | number | null;
  discountAmount?: string | number | null;
  finalAmount?: string | number | null;
  paymentStatus?: string;
  status: string;
}

export async function getSessionsByTable(
  tableId: string,
): Promise<TableSessionHistoryItem[]> {
  return apiGet<TableSessionHistoryItem[]>(
    `/table-sessions/history-by-table/${encodeURIComponent(tableId)}`,
  );
}

export async function getOpenSessionByTable(
  tableId: string,
): Promise<OpenSessionResponse> {
  return apiGet<OpenSessionResponse>(
    `/table-sessions/by-table/${encodeURIComponent(tableId)}`,
  );
}

export async function closeTableSession(
  tableId: string,
): Promise<CloseTableSessionResult> {
  return apiPost<CloseTableSessionResult>(
    `/table-sessions/${encodeURIComponent(tableId)}/close`,
  );
}

export interface UpdateSessionAccountPayload {
  serviceFeeAmount?: number;
  discountAmount?: number;
}

export async function updateSessionAccount(
  sessionId: string,
  data: UpdateSessionAccountPayload,
): Promise<ClosedSessionSession> {
  return apiPatch<ClosedSessionSession>(
    `/table-sessions/account/${encodeURIComponent(sessionId)}`,
    data,
  );
}

export async function markSessionAsPaid(sessionId: string): Promise<ClosedSessionSession> {
  return apiPost<ClosedSessionSession>(
    `/table-sessions/account/${encodeURIComponent(sessionId)}/pay`,
  );
}

export interface CreateSessionPixResponse {
  mpPaymentId: string | null;
  status?: string;
  qrCodeBase64: string | null;
  qrCode: string | null;
  expiresAt?: null;
}

export async function createSessionPix(
  sessionId: string,
  payerEmail?: string,
): Promise<CreateSessionPixResponse> {
  return apiPost<CreateSessionPixResponse>(
    `/table-sessions/account/${encodeURIComponent(sessionId)}/pix`,
    payerEmail ? { payerEmail } : undefined,
  );
}

export interface ReportTodayResponse {
  revenueToday: number;
  sessionsCount: number;
  paidSessions: number;
  pendingSessions: number;
  averageTicket: number | null;
  tableRanking: Array<{
    tableId: string;
    tableName: string;
    totalRevenue: number;
    paidRevenue?: number;
    sessionsCount: number;
    averageTicket?: number;
  }>;
}

export interface CashierSummaryResponse {
  paidRevenueToday: number;
  pendingRevenueToday: number;
  closedSessionsToday: number;
  openSessionsNow: number;
  paidSessionsToday: number;
  pendingSessionsToday: number;
  averagePaidTicketToday: number | null;
}

export interface ReportRangeResponse {
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
}

export async function getReportToday(
  establishmentId: string,
): Promise<ReportTodayResponse> {
  return apiGet<ReportTodayResponse>(
    `/table-sessions/report-today/${encodeURIComponent(establishmentId)}`,
  );
}

export async function getCashierSummary(
  establishmentId: string,
): Promise<CashierSummaryResponse> {
  return apiGet<CashierSummaryResponse>(
    `/table-sessions/cashier-summary/${encodeURIComponent(establishmentId)}`,
  );
}

export async function getReportRange(
  establishmentId: string,
  from: string,
  to: string,
): Promise<ReportRangeResponse> {
  const params = new URLSearchParams({ from, to });
  return apiGet<ReportRangeResponse>(
    `/table-sessions/report-range/${encodeURIComponent(establishmentId)}?${params}`,
  );
}
