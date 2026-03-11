'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { createPix, getPaymentStatus } from '@/services/payment.service';
import type { Order } from '@/types/order';

const POLL_INTERVAL_MS = 3000;

export interface PixStepProps {
  order: Order;
  total: number;
  establishmentId: string;
  payerEmail?: string;
  storeSlug: string;
  onPaid: () => void;
  onBack?: () => void;
}

export function PixStep({
  order,
  total,
  establishmentId,
  payerEmail,
  storeSlug,
  onPaid,
  onBack,
}: PixStepProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchPix = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await createPix({
        establishmentId,
        orderId: order.id,
        amount: total,
        payerEmail,
      });
      setPaymentId(res.paymentId);
      setQrCodeBase64(res.qrCodeBase64 ?? null);
      setQrCode(res.qrCode ?? null);
      if (res.status === 'approved') {
        onPaid();
        return;
      }
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Erro ao gerar PIX');
    } finally {
      setLoading(false);
    }
  }, [establishmentId, order.id, total, payerEmail, onPaid]);

  useEffect(() => {
    fetchPix();
  }, [fetchPix]);

  useEffect(() => {
    if (!paymentId || loading) return;
    const timer = setInterval(async () => {
      try {
        const status = await getPaymentStatus(paymentId);
        if (status.status === 'approved' || status.orderPaymentStatus === 'PAID') {
          onPaid();
        }
      } catch {
        // ignore poll errors
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paymentId, loading, onPaid]);

  const copyPixCode = () => {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading && !qrCodeBase64) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-600">Gerando PIX...</p>
      </div>
    );
  }

  if (error && !paymentId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <Button className="mt-4" onClick={fetchPix} variant="outline">
          Tentar novamente
        </Button>
        {onBack && (
          <Button className="mt-2 ml-2" variant="outline" onClick={onBack}>
            Voltar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Pague com PIX</h2>
      <p className="mt-1 text-sm text-gray-600">
        Pedido #{order.code} · {formatCurrency(total)}
      </p>
      <div className="mt-6 flex flex-col items-center">
        {qrCodeBase64 && (
          <div className="relative inline-block rounded-lg border border-gray-200 bg-white p-2">
            <Image
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code PIX"
              width={220}
              height={220}
              unoptimized
            />
          </div>
        )}
        {qrCode && (
          <div className="mt-4 w-full max-w-sm">
            <p className="mb-1 text-xs text-gray-500">Ou copie o código PIX:</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={qrCode}
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={copyPixCode}>
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>
        )}
        <p className="mt-6 text-sm text-gray-500">
          Abra o app do seu banco, escolha PIX e escaneie o QR code ou cole o código.
          <br />
          O pedido será confirmado automaticamente ao detectar o pagamento.
        </p>
      </div>
    </div>
  );
}
