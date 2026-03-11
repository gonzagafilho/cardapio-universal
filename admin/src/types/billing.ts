/** Assinatura atual do tenant (resposta GET /billing/subscription) */
export interface SubscriptionView {
  id: string;
  tenantId: string;
  plan: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
  trialStartsAt?: string | null;
  trialEndsAt?: string | null;
  isTrialActive?: boolean;
  isTrialExpired?: boolean;
  daysLeftInTrial?: number | null;
}

/** Item do histórico de faturas (GET /billing/invoices) */
export interface InvoiceView {
  id: string;
  tenantId: string;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  status: string;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
}
