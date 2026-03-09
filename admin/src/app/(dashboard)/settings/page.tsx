'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getStoreSettings, updateStoreSettings } from '@/services/settings.service';
import { SettingsForm } from '@/components/forms';
import { LoadingPage } from '@/components/ui/loading';

export default function SettingsPage() {
  const { user } = useAuth();
  const establishmentId = user?.establishmentId ?? '';
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStoreSettings(establishmentId).then((d) => setSettings((d as Record<string, unknown>) ?? {})).finally(() => setLoading(false));
  }, [establishmentId]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await updateStoreSettings(establishmentId, data);
      setSettings((p) => (p ? { ...p, ...data } : data));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      <SettingsForm defaultValues={settings ?? undefined} onSubmit={handleSubmit} loading={saving} />
    </div>
  );
}
