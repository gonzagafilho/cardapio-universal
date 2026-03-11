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
  /** Link da página do carrinho. Se não informado, usa /{storeSlug}/cart ou /cart quando linkBase === ''. */
  cartHref?: string;
}

export function CartDrawer({ open, onClose, storeSlug, linkBase, cartHref: cartHrefProp }: CartDrawerProps) {
  const cartHref =
    cartHrefProp ??
    (linkBase === '' ? '/cart' : `/${storeSlug}/cart`);
  const { items, subtotal, discount, deliveryFee, total, updateQuantity, removeItem, itemCount } =
    useCart();

  return (
    <Drawer open={open} onClose={onClose} title="Carrinho" badge={itemCount > 0 ? itemCount : undefined}>
      <div className="flex flex-col p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 mb-1">Seu carrinho está vazio.</p>
            <p className="text-sm text-gray-400 mb-6">Adicione itens pelo cardápio.</p>
            <Button variant="outline" onClick={onClose} className="rounded-xl border-gray-200">
              Continuar comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto -mx-1 pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-card"
                >
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.product.name}
                      </p>
                      {item.selectedOptions.length > 0 && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {item.selectedOptions.map((o) => o.itemName).join(' · ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="mt-0.5 text-xs text-gray-500 italic">
                          Obs: {item.notes}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 font-semibold text-primary">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-xl border border-gray-200 bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="rounded-l-xl px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="rounded-r-xl px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
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
            <Link href={cartHref} onClick={onClose} className="block mt-4">
              <Button fullWidth size="lg" className="rounded-xl bg-gray-900 hover:bg-gray-800">
                Ver carrinho e finalizar
              </Button>
            </Link>
          </>
        )}
      </div>
    </Drawer>
  );
}
