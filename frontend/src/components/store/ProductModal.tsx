'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { useCart } from '@/hooks/useCart';
import type { Product, ProductOptionGroup, ProductOptionItem } from '@/types/product';
import type { SelectedOption } from '@/types/cart';

export interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  storeSlug: string;
  establishmentId: string;
}

export function ProductModal({
  product,
  open,
  onClose,
  storeSlug,
  establishmentId,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  const { addItem, setStore } = useCart();

  const unitPrice = product
    ? Number(product.promotionalPrice ?? product.price)
    : 0;
  const optionsTotal = selectedOptions.reduce((s, o) => s + o.price, 0);
  const totalPrice = (unitPrice + optionsTotal) * quantity;

  const toggleOption = (group: ProductOptionGroup, item: ProductOptionItem) => {
    const isSelected = selectedOptions.some(
      (o) => o.groupId === group.id && o.itemId === item.id
    );
    if (isSelected) {
      setSelectedOptions((prev) =>
        prev.filter((o) => !(o.groupId === group.id && o.itemId === item.id))
      );
    } else {
      const currentInGroup = selectedOptions.filter((o) => o.groupId === group.id);
      if (currentInGroup.length >= group.maxSelect) return;
      setSelectedOptions((prev) => [
        ...prev.filter((o) => o.groupId !== group.id),
        {
          groupId: group.id,
          groupName: group.name,
          itemId: item.id,
          itemName: item.name,
          price: Number(item.price),
        },
      ]);
    }
  };

  const canSubmit = useMemo(() => {
    if (!product?.optionGroups) return true;
    for (const g of product.optionGroups) {
      if (!g.isRequired) continue;
      const count = selectedOptions.filter((o) => o.groupId === g.id).length;
      if (count < g.minSelect) return false;
    }
    return true;
  }, [product, selectedOptions]);

  const handleAdd = () => {
    if (!product) return;
    setStore(storeSlug, establishmentId);
    addItem({
      product,
      quantity,
      notes: notes.trim() || undefined,
      selectedOptions,
    });
    onClose();
    setQuantity(1);
    setNotes('');
    setSelectedOptions([]);
  };

  const handleClose = () => {
    setQuantity(1);
    setNotes('');
    setSelectedOptions([]);
    onClose();
  };

  if (!product) return null;

  const unavailable = product.isAvailable === false;

  return (
    <Modal open={open} onClose={handleClose} title={product.name}>
      <div className="space-y-4">
        {unavailable && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Este produto está temporariamente indisponível.
          </p>
        )}
        {product.imageUrl && (
          <div className="relative -mx-4 -mt-4 aspect-video overflow-hidden rounded-t-xl bg-gray-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
            />
          </div>
        )}
        {product.description && (
          <p className="text-sm text-gray-600">{product.description}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">
            {formatCurrency(unitPrice)}
          </span>
          {product.promotionalPrice != null && (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(Number(product.price))}
            </span>
          )}
        </div>

        {product.optionGroups && product.optionGroups.length > 0 && (
          <div className="space-y-3">
            {product.optionGroups.map((group) => (
              <div key={group.id}>
                <p className="mb-1 font-medium text-gray-900">
                  {group.name}
                  {group.isRequired && (
                    <span className="text-red-500"> *</span>
                  )}
                  {group.minSelect > 0 && (
                    <span className="text-sm text-gray-500">
                      {' '}(mín. {group.minSelect}, máx. {group.maxSelect})
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items
                    .filter((i) => i.isActive)
                    .map((item) => {
                      const selected = selectedOptions.some(
                        (o) => o.groupId === group.id && o.itemId === item.id
                      );
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleOption(group, item)}
                          className={`rounded-lg border px-3 py-1.5 text-sm ${
                            selected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-300 text-gray-700 hover:border-primary/50'
                          }`}
                        >
                          {item.name}{' '}
                          {Number(item.price) > 0 && (
                            <span className="text-primary">
                              +{formatCurrency(Number(item.price))}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Observações
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: sem cebola"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100"
            >
              −
            </button>
            <span className="w-10 text-center font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <div className="flex-1 text-right text-lg font-bold text-primary">
            {formatCurrency(totalPrice)}
          </div>
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={handleAdd}
          disabled={!canSubmit || unavailable}
        >
          {unavailable ? 'Indisponível' : 'Adicionar ao carrinho'}
        </Button>
      </div>
    </Modal>
  );
}
