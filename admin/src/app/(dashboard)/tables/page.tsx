'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '@/hooks/useAuth';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { LoadingPage } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type Column } from '@/components/tables';
import { Badge } from '@/components/ui/badge';
import {
  getEstablishmentTables,
  createEstablishmentTable,
  regenerateEstablishmentTableToken,
} from '@/services/table.service';
import { getEstablishment } from '@/services/establishment.service';
import { canAccessTables } from '@/lib/permissions';
import type { Table } from '@/types/table';
import type { Establishment } from '@/types/establishment';

export default function TablesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Table[]>([]);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [qrByTableId, setQrByTableId] = useState<Record<string, string>>({});
  const [qrLoadingId, setQrLoadingId] = useState<string | null>(null);

  const canView = user ? canAccessTables(user.role) : false;
  const establishmentId = user?.establishmentId ?? null;

  const refresh = async () => {
    if (!establishmentId) return;
    const data = await getEstablishmentTables(establishmentId);
    setList(data ?? []);
  };

  useEffect(() => {
    if (!user || !canView || !establishmentId) {
      setLoading(false);
      return;
    }

    Promise.all([
      refresh(),
      getEstablishment(establishmentId).then(setEstablishment),
    ]).finally(() => setLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, canView, establishmentId]);

  if (!user) return null;
  if (loading) return <LoadingPage />;
  if (!canView) {
    return <AccessDenied description="Seu perfil não pode acessar esta área." />;
  }

  const handleCreate = async () => {
    if (!establishmentId) return;

    const n = name.trim();
    if (!n) return;

    setSaving(true);
    try {
      await createEstablishmentTable(establishmentId, {
        name: n,
        number: number.trim() || undefined,
      });

      setName('');
      setNumber('');
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async (tableId: string) => {
    if (!establishmentId) return;
    await regenerateEstablishmentTableToken(establishmentId, tableId);
    await refresh();
  };

  const generateQRCode = async (url: string) => {
    return QRCode.toDataURL(url, { margin: 1, width: 512 });
  };

  const buildPublicUrl = (slug: string, token: string) =>
    `https://app.cardapio.nexoracloud.com.br/${slug}?table=${token}`;

  const tableTitle = (t: Table) =>
    t.number != null && String(t.number).trim() !== ''
      ? `Mesa ${t.number}`
      : t.name;

    const openPrintWindow = (
    w: Window,
    payload: {
      establishmentName: string;
      establishmentLogoUrl?: string | null;
      tableTitle: string;
      qrDataUrl: string;
      publicUrl: string;
    }
  ) => {
    const {
      establishmentName,
      establishmentLogoUrl,
      tableTitle,
      qrDataUrl,
      publicUrl,
    } = payload;

    const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>QR Code - ${tableTitle}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      html, body {
        background: #fff;
        color: #0f172a;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif;
      }
      * { box-sizing: border-box; }
      .sheet {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 6mm 0;
      }
      .card {
        width: 92mm;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 14px 14px 12px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }
      .logo {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        object-fit: contain;
        background: #fff;
        border: 1px solid #f1f5f9;
      }
      .name {
        font-weight: 800;
        font-size: 14px;
        line-height: 1.2;
      }
      .subtitle {
        color: #475569;
        font-size: 12px;
        margin-top: 2px;
      }
      .tableTitle {
        margin-top: 10px;
        font-size: 24px;
        font-weight: 900;
        letter-spacing: -0.02em;
      }
      .qrWrap {
        margin-top: 12px;
        display: flex;
        justify-content: center;
      }
      .qr {
        width: 72mm;
        height: 72mm;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        padding: 10px;
      }
      .hint {
        margin-top: 10px;
        font-size: 12px;
        color: #334155;
        text-align: center;
      }
      .url {
        margin-top: 8px;
        font-size: 10px;
        color: #64748b;
        text-align: center;
        word-break: break-all;
      }
      .footer {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 11px;
        color: #334155;
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="card">
        <div class="brand">
          ${establishmentLogoUrl ? `<img class="logo" src="${establishmentLogoUrl}" alt="Logo" />` : ''}
          <div>
            <div class="name">${establishmentName}</div>
            <div class="subtitle">Acesse o cardápio digital</div>
          </div>
        </div>
        <div class="tableTitle">${tableTitle}</div>
        <div class="qrWrap">
          <img class="qr" src="${qrDataUrl}" alt="QR Code" />
        </div>
        <div class="hint">Aponte a câmera do celular para o QR Code</div>
        <div class="url">${publicUrl}</div>
        <div class="footer">Obrigado e bom apetite.</div>
      </div>
    </div>
    <script>
      window.addEventListener('load', () => {
        setTimeout(() => window.print(), 80);
      });
    </script>
  </body>
</html>`;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const handleGenerateQR = async (table: Table) => {
    if (!establishment?.slug || !table.token) return;

    const url = buildPublicUrl(establishment.slug, table.token);
    setQrLoadingId(table.id);

    try {
      const dataUrl = await generateQRCode(url);
      setQrByTableId((cur) => ({ ...cur, [table.id]: dataUrl }));
    } finally {
      setQrLoadingId(null);
    }
  };

   const handlePrintPreview = async (table: Table) => {
    if (!establishment?.slug || !table.token) return;

    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Gerando impressão...</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #ffffff;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          Gerando visualização de impressão...
        </body>
      </html>
    `);
    printWindow.document.close();

    const publicUrl = buildPublicUrl(establishment.slug, table.token);

    setQrLoadingId(table.id);
    try {
      const existing = qrByTableId[table.id];
      const qrDataUrl = existing ?? (await generateQRCode(publicUrl));

      if (!existing) {
        setQrByTableId((cur) => ({ ...cur, [table.id]: qrDataUrl }));
      }

      openPrintWindow(printWindow, {
        establishmentName: establishment.name,
        establishmentLogoUrl: establishment.logoUrl,
        tableTitle: tableTitle(table),
        qrDataUrl,
        publicUrl,
      });
    } catch (error) {
      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html lang="pt-BR">
          <head>
            <meta charset="utf-8" />
            <title>Erro ao gerar impressão</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 24px;">
            <h2>Não foi possível gerar a visualização.</h2>
            <p>Verifique o console do navegador e tente novamente.</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      console.error('Erro ao gerar visualização de impressão:', error);
    } finally {
      setQrLoadingId(null);
    }
  };

  const columns: Column<Table>[] = [
    { key: 'name', header: 'Nome' },
    { key: 'number', header: 'Número' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row: Table) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      key: 'token',
      header: 'Link/Token',
      render: (row: Table) => {
        if (!row.token) {
          return (
            <Button variant="ghost" size="sm" onClick={() => handleRegenerate(row.id)}>
              Gerar token
            </Button>
          );
        }

        const href = establishment?.slug
          ? buildPublicUrl(establishment.slug, row.token)
          : `?table=${row.token}`;

        const qr = qrByTableId[row.id];
        const qrUrl = establishment?.slug
          ? buildPublicUrl(establishment.slug, row.token)
          : null;

        return (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-gray-700">{row.token}</span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard?.writeText(href)}
              >
                Copiar link
              </Button>

              <Button variant="ghost" size="sm" onClick={() => handleRegenerate(row.id)}>
                Regenerar
              </Button>

              <Button
                variant="ghost"
                size="sm"
                loading={qrLoadingId === row.id}
                disabled={!qrUrl}
                onClick={() => handleGenerateQR(row)}
              >
                Gerar QR Code
              </Button>

              <Button
                variant="outline"
                size="sm"
                loading={qrLoadingId === row.id}
                disabled={!qrUrl}
                onClick={() => handlePrintPreview(row)}
              >
                Visualizar impressão
              </Button>

              {qr && (
                <a
                  href={qr}
                  download={`mesa-${row.number ?? row.name ?? row.id}.png`}
                  className="inline-flex"
                >
                  <Button variant="ghost" size="sm">
                    Baixar PNG
                  </Button>
                </a>
              )}
            </div>

            {qr && (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <img
                  src={qr}
                  alt={`QR Code ${row.number ?? row.name ?? ''}`}
                  className="h-40 w-40"
                />
                {qrUrl && (
                  <div className="mt-2 break-all font-mono text-xs text-gray-500">
                    {qrUrl}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Mesas / Comandas</h1>

      {!establishmentId ? (
        <AccessDenied description="Usuário sem estabelecimento vinculado." />
      ) : (
        <>
          <div className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Criar mesa</h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                label="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Mesa 01"
              />

              <Input
                label="Número (opcional)"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="01"
              />

              <div className="flex items-end">
                <Button onClick={handleCreate} loading={saving} disabled={!name.trim()}>
                  Criar
                </Button>
              </div>
            </div>
          </div>

          <DataTable<Table>
            columns={columns}
            data={list}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma mesa cadastrada."
          />
        </>
      )}
    </div>
  );
}