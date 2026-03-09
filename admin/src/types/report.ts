export interface SalesSummary {
  total: number;
  count: number;
  start: string;
  end: string;
}

export interface OrdersByDay {
  [date: string]: { count: number; total: number };
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  total: number;
}

export interface PaymentMethodsReport {
  [method: string]: number;
}
