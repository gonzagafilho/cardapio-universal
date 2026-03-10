'use client';

import Link from 'next/link';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { CartSummary } from './CartSummary';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/currency';

export interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  storeSlug: string;
  /** Base path para links ('' = domínio custom). */
  linkBase?: string;
}

export function CartDrawer({ open, onClose, storeSlug, linkBase }: CartDrawerProps) {
  const cartHref = linkBase !== undefined ? (linkBase ? `${linkBase}/cart` : '/cart') : `/${storeSlug}/cart`;
  const { items, subtotal, discount, deliveryFee, total, updateQuantity, removeItem } =
    useCart();

  return (
    <Drawer open={open} onClose={onClose} title="Carrinho">
      <div className="flex flex-col p-4">
        {items.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p className="mb-4">Seu carrinho está vazio.</p>
            <Button variant="outline" onClick={onClose}>
              Continuar comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      {item.selectedOptions.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {item.selectedOptions
                            .map((o) => o.itemName)
                            .join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-gray-500">
                          Obs: {item.notes}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 font-medium text-primary">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded border border-gray-300">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-2 py-1 text-gray-600"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2 py-1 text-gray-600"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <CartSummary
              subtotal={subtotal}
              discount={discount}
              deliveryFee={deliveryFee}
              total={total}
            />
            <Link href={cartHref} onClick={onClose}>
              <Button fullWidth size="lg" className="mt-4">
                Ver carrinho e finalizar
              </Button>
            </Link>
          </>
        )}
      </div>
    </Drawer>
  );
}
