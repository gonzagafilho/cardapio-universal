export type PaymentMethodType = 'pix' | 'card' | 'cash' | 'other';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  description?: string;
}
