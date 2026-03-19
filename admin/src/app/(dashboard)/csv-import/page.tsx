'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { LoadingPage } from '@/components/ui/loading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency';
import type { CsvCommitResponse, CsvEntity, CsvPreviewResponse, CsvRowPreview } from '@/services/csv-import.service';
import { previewCsvImport, commitCsvImport } from '@/services/csv-import.service';
import { Input } from '@/components/ui/input';

type PreviewRow = CsvRowPreview<any>;

function allowedRoles(role: string | null | undefined) {
  return (
    role === 'SUPER_ADMIN' ||
    role === 'TENANT_OWNER' ||
    role === 'TENANT_ADMIN' ||
    role === 'MANAGER'
  );
}

function renderRecord(entity: CsvEntity, record: any) {
  if (!record) return null;
  if (entity === 'categories') {
    return (
      <div className="text-sm text-gray-700">
        <div className="font-medium text-gray-900">{record.name}</div>
        {record.description ? <div className="text-xs text-gray-500">{record.description}</div> : null}
        <div className="text-xs text-gray-500">isActive: {String(record.isActive)}</div>
      </div>
    );
  }
  if (entity === 'products') {
    return (
      <div className="text-sm text-gray-700">
        <div className="font-medium text-gray-900">{record.name}</div>
        <div className="text-xs text-gray-500">
          {record.categoryName} · {formatCurrency(Number(record.price ?? 0))}
        </div>
        <div className="text-xs text-gray-500">isActive: {String(record.isActive)}</div>
      </div>
    );
  }
  return (
    <div className="text-sm text-gray-700">
      <div className="font-medium text-gray-900">{record.name}</div>
      <div className="text-xs text-gray-500">
        {(record.number ?? '').toString() ? `#${record.number}` : 'Sem número'} · isActive: {String(record.isActive)}
      </div>
    </div>
  );
}

export default function CsvImportPage() {
  const { user, loading } = useAuth();
  const establishmentId = user?.establishmentId ?? '';
  const roleOk = allowedRoles(user?.role);

  const [entity, setEntity] = useState<CsvEntity>('categories');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [commitLoading, setCommitLoading] = useState(false);
  const [commitResult, setCommitResult] = useState<CsvCommitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const entityLabel = useMemo(() => {
    if (entity === 'categories') return 'categorias.csv';
    if (entity === 'products') return 'produtos.csv';
    return 'mesas.csv';
  }, [entity]);

  if (loading) return <LoadingPage />;
  if (!user) return <AccessDenied description="Faça login para importar." />;
  if (!roleOk) return <AccessDenied description="Seu perfil não pode importar CSV." />;
  if (!establishmentId) return <AccessDenied description="Usuário sem estabelecimento vinculado." />;

  const onPreview = async () => {
    setError(null);
    setCommitResult(null);
    setPreview(null);
    if (!file) {
      setError('Selecione um arquivo CSV.');
      return;
    }
    setPreviewLoading(true);
    try {
      const resp = await previewCsvImport(entity, establishmentId, file);
      setPreview(resp);
    } catch (e) {
      setError((e as any)?.message ?? 'Erro ao validar CSV');
    } finally {
      setPreviewLoading(false);
    }
  };

  const onCommit = async () => {
    if (!preview) return;
    setError(null);
    setCommitResult(null);

    const valid = preview.rows
      .filter((r) => r.errors.length === 0 && r.record)
      .map((r) => ({ rowNumber: r.rowNumber, record: r.record }));

    if (valid.length === 0) {
      setError('Não há linhas válidas para importar. Corrija o CSV e tente novamente.');
      return;
    }
    if (preview.invalidRows > 0) {
      setError('O CSV possui linhas inválidas. Corrija o arquivo e gere um novo preview.');
      return;
    }

    setCommitLoading(true);
    try {
      const resp = await commitCsvImport(entity, establishmentId, valid);
      setCommitResult(resp);
    } catch (e) {
      setError((e as any)?.message ?? 'Erro ao importar CSV');
    } finally {
      setCommitLoading(false);
    }
  };

  const previewRows = preview?.rows ?? [];
  const maxToRender = 50;
  const trimmedRows = previewRows.slice(0, maxToRender);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Importador CSV</h1>
          <p className="mt-1 text-sm text-gray-600">
            Preview e validação antes de importar categorias, produtos e mesas.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Select
              label="Entidade"
              value={entity}
              options={[
                { value: 'categories', label: 'Categorias (categorias.csv)' },
                { value: 'products', label: 'Produtos (produtos.csv)' },
                { value: 'tables', label: 'Mesas (mesas.csv)' },
              ]}
              onChange={(e) => setEntity(e.target.value as CsvEntity)}
            />

            <Input
              type="text"
              label="Formato esperado"
              value={entityLabel}
              disabled
              className="cursor-not-allowed"
            />

            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Enviar CSV
              </label>
              <input
                type="file"
                accept=".csv,text/csv"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={onPreview} loading={previewLoading} disabled={previewLoading}>
              Preview e validar
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={onCommit}
              loading={commitLoading}
              disabled={commitLoading || preview == null || preview.invalidRows > 0}
            >
              Confirmar importação
            </Button>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {preview ? (
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="text-xs font-medium text-gray-500">Linhas</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{preview.totalRows}</div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="text-xs font-medium text-gray-500">Válidas</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{preview.validRows}</div>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm">
                <div className="text-xs font-medium text-red-700">Inválidas</div>
                <div className="mt-1 text-sm font-semibold text-red-800">{preview.invalidRows}</div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="text-xs font-medium text-gray-500">Importação</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {preview.invalidRows > 0 ? 'Bloqueada (corrigir)' : 'Liberada (confirmar)'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Preview {preview.invalidRows > 0 ? '(mostrando erros até 50 linhas)' : '(linhas válidas)' }
              </h2>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="max-h-[420px] overflow-auto">
                  <ul className="divide-y divide-gray-100">
                    {trimmedRows.map((r) => (
                      <li key={`${r.rowNumber}`} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold text-gray-900">Linha {r.rowNumber}</div>
                            {r.errors.length > 0 ? (
                              <div className="mt-1 text-sm text-red-700 font-medium">
                                {r.errors.join('; ')}
                              </div>
                            ) : (
                              <div className="mt-2">{renderRecord(entity, r.record)}</div>
                            )}
                          </div>
                          {r.errors.length === 0 ? (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                              OK
                            </span>
                          ) : (
                            <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                              Erro
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {previewRows.length > maxToRender ? (
                <p className="text-xs text-gray-500">
                  Mostrando {maxToRender} de {previewRows.length} linhas.
                </p>
              ) : null}
            </div>

            {commitResult ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="text-sm font-semibold text-emerald-900">Importação concluída</div>
                <div className="mt-1 text-xs text-emerald-800">
                  Criados: {commitResult.created} · Atualizados: {commitResult.updated}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Modelos aceitos</h2>
          <div className="text-xs text-gray-600 space-y-2">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 font-mono">
              categorias.csv: <br />
              name,description,isActive
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 font-mono">
              produtos.csv: <br />
              categoryName,name,description,price,isActive
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 font-mono">
              mesas.csv: <br />
              name,number,isActive
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

