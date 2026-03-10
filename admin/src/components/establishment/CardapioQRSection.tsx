'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { APP_PUBLIC_URL } from '@/lib/constants';

interface CardapioQRSectionProps {
  slug: string;
}

export function CardapioQRSection({ slug }: CardapioQRSectionProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const menuUrl = slug
    ? `${APP_PUBLIC_URL.replace(/\/$/, '')}/${slug}`
    : '';

  useEffect(() => {
    if (!menuUrl) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(menuUrl, { width: 256, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [menuUrl]);

  const handleCopy = async () => {
    if (!menuUrl) return;
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: não quebra se clipboard falhar
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `cardapio-${slug || 'estabelecimento'}.png`;
    a.click();
  };

  if (!slug) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">
        Link do cardápio público
      </h2>
      <p className="mb-2 break-all text-sm text-gray-600" title={menuUrl}>
        {menuUrl}
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {copied ? 'Copiado!' : 'Copiar link'}
        </Button>
      </div>
      {qrDataUrl && (
        <div className="flex flex-col items-start gap-2">
          <img
            src={qrDataUrl}
            alt={`QR Code do cardápio ${slug}`}
            className="rounded border border-gray-200 bg-white"
            width={256}
            height={256}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
            Baixar QR (PNG)
          </Button>
        </div>
      )}
    </section>
  );
}
