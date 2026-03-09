'use client';

import { Badge } from '@/components/ui/badge';
import { getOrderStatusLabel } from '@/lib/format';

export function OrderStatusBadge({ status }: { status: string }) {
  const variant = status === 'CANCELLED' ? 'error' : status === 'DELIVERED' ? 'success' : 'default';
  return <Badge variant={variant}>{getOrderStatusLabel(status)}</Badge>;
}
