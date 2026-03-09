export type OrderStatus =
  | 'PENDING'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
}

export interface Order {
  id: string;
  tenantId: string;
  establishmentId: string;
  customerId: string | null;
  code: string;
  type: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}
