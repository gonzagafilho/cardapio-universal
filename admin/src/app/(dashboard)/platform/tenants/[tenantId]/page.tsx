'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { DataTable, type Column } from '@/components/tables';
import { canAccessPlatform } from '@/lib/permissions';
import {
  bindServiceToTenant,
  createPixInvoice,
  getBillingInvoiceById,
  getServiceCatalog,
  getTenantServices,
  updateTenantServiceBinding,
} from '@/services/master-services.service';
import type {
  BillingInvoiceItem,
  ServiceCatalogItem,
  TenantServiceBindingItem,
  TenantServicesResponse,
} from '@/types/master-services';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function PlatformTenantServicesPage() {
  const { user } = useAuth();
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [data, setData] = useState<TenantServicesResponse | null>(null);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceByBinding, setInvoiceByBinding] = useState<Record<string, BillingInvoiceItem | null>>({});
  const [bindForm, setBindForm] = useState({
    serviceCatalogId: '',
    status: 'active',
    plan: '',
    notes: '',
  });
  const [amountByBinding, setAmountByBinding] = useState<Record<string, string>>({});
  const canView = user ? canAccessPlatform(user.role) : false;

  const loadData = async () => {
    const [tenantServices, servicesCatalog] = await Promise.all([
      getTenantServices(tenantId),
      getServiceCatalog(),
    ]);
    setData(tenantServices);
    setCatalog(servicesCatalog);
    const nextInvoices: Record<string, BillingInvoiceItem | null> = {};
    for (const b of tenantServices.bindings) {
      const latest = b.billingInvoices?.[0];
      nextInvoices[b.id] = latest ?? null;
      if (latest?.amountCents != null) {
        setAmountByBinding((prev) => ({
          ...prev,
          [b.id]: prev[b.id] ?? String(latest.amountCents),
        }));
      }
    }
    setInvoiceByBinding(nextInvoices);
  };

  useEffect(() => {
    if (!user || !canView) {
      setLoading(false);
      return;
    }
    loadData()
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user, canView, tenantId]);

  const onBindService = async () => {
    setError(null);
    if (!bindForm.serviceCatalogId) {
      setError('Selecione um serviço do catálogo para vincular.');
      return;
    }
    setSaving(true);
    try {
      await bindServiceToTenant(tenantId, {
        serviceCatalogId: bindForm.serviceCatalogId,
        status: bindForm.status,
        plan: bindForm.plan || undefined,
        notes: bindForm.notes || undefined,
        activatedAt: bindForm.status === 'active' ? new Date().toISOString() : undefined,
      });
      setBindForm({ serviceCatalogId: '', status: 'active', plan: '', notes: '' });
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível vincular o serviço.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const onQuickStatusUpdate = async (row: TenantServiceBindingItem, status: string) => {
    setError(null);
    setSaving(true);
    try {
      await updateTenantServiceBinding(tenantId, row.id, {
        status,
        suspendedAt: status === 'suspended' ? new Date().toISOString() : undefined,
        activatedAt: status === 'active' ? new Date().toISOString() : undefined,
      });
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível atualizar vínculo.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const onGeneratePix = async (row: TenantServiceBindingItem) => {
    setError(null);
    const amountRaw = amountByBinding[row.id] ?? '';
    const amountCents = Number(amountRaw);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError('Informe um valor em centavos válido para gerar PIX.');
      return;
    }
    setSaving(true);
    try {
      const invoice = await createPixInvoice({
        tenantId,
        serviceBindingId: row.id,
        amountCents,
      });
      const fresh = await getBillingInvoiceById(invoice.id);
      setInvoiceByBinding((prev) => ({ ...prev, [row.id]: fresh }));
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível gerar cobrança PIX.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  if (loading) return <LoadingPage />;
  if (!canView) {
    return <AccessDenied description="Acesso restrito à plataforma. Apenas Super Admin." />;
  }

  const bindings = data?.bindings ?? [];
  const tenant = data?.tenant;

  const columns: Column<TenantServiceBindingItem>[] = [
    {
      key: 'service',
      header: 'Serviço',
      render: (row) => row.service.name,
    },
    {
      key: 'serviceKey',
      header: 'Key',
      render: (row) => row.service.key,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'activatedAt',
      header: 'Ativado em',
      render: (row) => formatDate(row.activatedAt),
    },
    {
      key: 'updatedAt',
      header: 'Atualizado em',
      render: (row) => formatDate(row.updatedAt),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-2">
          <input
            value={amountByBinding[row.id] ?? ''}
            onChange={(e) =>
              setAmountByBinding((prev) => ({ ...prev, [row.id]: e.target.value }))
            }
            placeholder="centavos"
            className="w-28 rounded border border-gray-300 px-2 py-1 text-xs"
            disabled={saving}
          />
          <Button variant="ghost" size="sm" onClick={() => onGeneratePix(row)} disabled={saving}>
            Gerar PIX
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuickStatusUpdate(row, row.status === 'active' ? 'suspended' : 'active')}
            disabled={saving}
          >
            {row.status === 'active' ? 'Suspender' : 'Ativar'}
          </Button>
        </div>
      ),
    },
    {
      key: 'invoice',
      header: 'Cobrança',
      render: (row) => {
        const invoice = invoiceByBinding[row.id];
        if (!invoice) return '—';
        return (
          <div className="max-w-xs space-y-1">
            <Badge
              variant={
                invoice.status === 'PAID'
                  ? 'success'
                  : invoice.status === 'PENDING'
                    ? 'warning'
                    : 'error'
              }
            >
              {invoice.status}
            </Badge>
            <p className="truncate text-xs text-gray-700">
              copia e cola: {invoice.pixCode ?? '—'}
            </p>
            {invoice.pixQrCodeUrl ? (
              <a
                href={invoice.pixQrCodeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 underline"
              >
                Abrir QR Code
              </a>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/platform/tenants">
          <Button variant="ghost" size="sm">
            Voltar
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          {tenant?.name ?? 'Tenant não encontrado'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Slug: <span className="font-medium">{tenant?.slug ?? '—'}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Vincular serviço</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select
            value={bindForm.serviceCatalogId}
            onChange={(e) => setBindForm((s) => ({ ...s, serviceCatalogId: e.target.value }))}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            disabled={saving}
          >
            <option value="">Selecione um serviço</option>
            {catalog.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.key})
              </option>
            ))}
          </select>
          <select
            value={bindForm.status}
            onChange={(e) => setBindForm((s) => ({ ...s, status: e.target.value }))}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            disabled={saving}
          >
            <option value="active">active</option>
            <option value="pending">pending</option>
            <option value="suspended">suspended</option>
            <option value="cancelled">cancelled</option>
          </select>
          <input
            value={bindForm.plan}
            onChange={(e) => setBindForm((s) => ({ ...s, plan: e.target.value }))}
            placeholder="Plano (opcional)"
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            disabled={saving}
          />
          <input
            value={bindForm.notes}
            onChange={(e) => setBindForm((s) => ({ ...s, notes: e.target.value }))}
            placeholder="Notas (opcional)"
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            disabled={saving}
          />
        </div>
        <div className="mt-3">
          <Button size="sm" onClick={onBindService} loading={saving}>
            Vincular serviço
          </Button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <DataTable<TenantServiceBindingItem>
        columns={columns}
        data={bindings}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum serviço vinculado para este tenant."
      />
    </div>
  );
}
