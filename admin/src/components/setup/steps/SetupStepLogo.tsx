'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { updateEstablishment } from '@/services/establishment.service';
import type { Establishment } from '@/types/establishment';

const DEFAULT_LOGO = 'https://placehold.co/200x200/e5e7eb/6b7280?text=Logo';
const DEFAULT_BANNER = 'https://placehold.co/1200x400/e5e7eb/6b7280?text=Capa';

export function SetupStepLogo({
  establishment,
  onSaved,
  onNext,
  onBack,
}: {
  establishment: Establishment;
  onSaved: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [logoUrl, setLogoUrl] = useState(establishment.logoUrl ?? '');
  const [bannerUrl, setBannerUrl] = useState(establishment.bannerUrl ?? '');
  const [useDefaults, setUseDefaults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateEstablishment(establishment.id, {
        logoUrl: useDefaults ? DEFAULT_LOGO : (logoUrl.trim() || undefined),
        bannerUrl: useDefaults ? DEFAULT_BANNER : (bannerUrl.trim() || undefined),
      });
      onSaved();
      onNext();
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const displayLogo = useDefaults ? DEFAULT_LOGO : (logoUrl.trim() || DEFAULT_LOGO);
  const displayBanner = useDefaults ? DEFAULT_BANNER : (bannerUrl.trim() || DEFAULT_BANNER);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Logo e capa</h2>
        <p className="mt-1 text-sm text-gray-500">Escolha as imagens que aparecerão no seu cardápio.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Logo</p>
          <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white">
            <img src={displayLogo} alt="Preview logo" className="h-full w-full object-contain" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Capa</p>
          <div className="aspect-[3/1] overflow-hidden rounded-xl border border-gray-200 bg-white">
            <img src={displayBanner} alt="Preview capa" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <input
          type="checkbox"
          checked={useDefaults}
          onChange={(e) => setUseDefaults(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className="text-sm font-medium text-gray-700">Usar imagens padrão por enquanto</span>
      </label>

      {!useDefaults && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <Input
            label="URL da logo"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="URL da capa"
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between border-t border-gray-100 pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="submit" loading={saving}>
          Continuar
        </Button>
      </div>
    </form>
  );
}
