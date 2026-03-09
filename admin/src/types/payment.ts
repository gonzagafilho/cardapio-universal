export interface Payment {
  id: string;
  tenantId: string;
  establishmentId: string;
  orderId: string;
  provider: string;
  method: string;
  status: string;
  amount: number;
  transactionId: string | null;
  externalReference: string | null;
  paidAt: string | null;
}
