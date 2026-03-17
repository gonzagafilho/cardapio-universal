'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { getStoreSettings, updateStoreSettings } from '@/services/settings.service';

export function SetupStepOrders({
  establishmentId,
  onNext,
  onBack,
}: {
  establishmentId: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [acceptsDelivery, setAcceptsDelivery] = useState(true);
  const [acceptsPickup, setAcceptsPickup] = useState(true);
  const [minimumOrder, setMinimumOrder] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStoreSettings(establishmentId)
      .then((data) => {
        const d = (data ?? {}) as Record<string, unknown>;
        if (d.acceptsDelivery !== undefined) setAcceptsDelivery(Boolean(d.acceptsDelivery));
        if (d.acceptsPickup !== undefined) setAcceptsPickup(Boolean(d.acceptsPickup));
        const min = d.minimumOrderAmount ?? d.minimumOrder;
        if (min != null) setMinimumOrder(String(min));
        const fee = d.deliveryFee;
        if (fee != null) setDeliveryFee(String(fee));
        const est = d.deliveryEstimate;
        if (est != null) setDeliveryEstimate(String(est));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [establishmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateStoreSettings(establishmentId, {
        acceptsDelivery,
        acceptsPickup,
        minimumOrder: minimumOrder ? Number(minimumOrder.replace(',', '.')) : undefined,
        minimumOrderAmount: minimumOrder ? Number(minimumOrder.replace(',', '.')) : undefined,
        deliveryFee: deliveryFee ? Number(deliveryFee.replace(',', '.')) : undefined,
        deliveryEstimate: deliveryEstimate ? Number(deliveryEstimate) : undefined,
      });
      onNext();
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500">Carregando...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Configuração de pedidos</h2>
        <p className="mt-1 text-sm text-gray-500">Defina como aceita pedidos e valores de entrega.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={acceptsDelivery} onChange={(e) => setAcceptsDelivery(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <span className="text-sm font-medium text-gray-700">Aceita entrega</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={acceptsPickup} onChange={(e) => setAcceptsPickup(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <span className="text-sm font-medium text-gray-700">Aceita retirada</span>
        </label>
      </div>
      <Input
        label="Pedido mínimo (R$)"
        type="text"
        inputMode="decimal"
        value={minimumOrder}
        onChange={(e) => setMinimumOrder(e.target.value)}
        placeholder="0,00"
      />
      <Input
        label="Taxa de entrega (R$)"
        type="text"
        inputMode="decimal"
        value={deliveryFee}
        onChange={(e) => setDeliveryFee(e.target.value)}
        placeholder="0,00"
      />
      <Input
        label="Tempo estimado de entrega (minutos)"
        type="number"
        min={0}
        value={deliveryEstimate}
        onChange={(e) => setDeliveryEstimate(e.target.value)}
        placeholder="45"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-between border-t border-gray-100 pt-6">
        <Button type="button" variant="outline" onClick={onBack}>Voltar</Button>
        <Button type="submit" loading={saving}>Continuar</Button>
      </div>
    </form>
  );
}
