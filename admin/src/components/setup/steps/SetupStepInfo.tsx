'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { updateEstablishment } from '@/services/establishment.service';
import type { Establishment } from '@/types/establishment';
import type { UpdateEstablishmentDto } from '@/types/establishment';

const TIPOS_RESTAURANTE = [
  'Restaurante',
  'Pizzaria',
  'Lanchonete',
  'Hamburgueria',
  'Café',
  'Bar',
  'Confeitaria',
  'Outro',
];

export function SetupStepInfo({
  establishment,
  initialBusinessType,
  onSaved,
  onNext,
}: {
  establishment: Establishment;
  initialBusinessType?: string;
  onSaved: () => void;
  onNext: () => void;
}) {
  const est = establishment as Establishment & { addressLine?: string };
  const [name, setName] = useState(est.name ?? '');
  const [phone, setPhone] = useState(est.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(est.whatsapp ?? '');
  const [city, setCity] = useState(est.city ?? '');
  const [address, setAddress] = useState(est.address ?? est.addressLine ?? '');
  const [tipo, setTipo] = useState(initialBusinessType?.trim() ?? '');
  const [description, setDescription] = useState(est.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const desc = [tipo.trim(), description.trim()].filter(Boolean).join(tipo && description ? ' — ' : '') || undefined;
      const dto: UpdateEstablishmentDto = {
        name: name.trim() || establishment.name,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        description: desc,
      };
      await updateEstablishment(establishment.id, dto);
      onSaved();
      onNext();
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Informações do restaurante</h2>
        <p className="mt-1 text-sm text-gray-500">Dados básicos que aparecerão no seu cardápio.</p>
      </div>

      <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do estabelecimento" />
      <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
      <Input label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="11999999999" />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de restaurante</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Selecione</option>
          {TIPOS_RESTAURANTE.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo" />
      <Input label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro" />
      <Textarea label="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição" rows={3} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-end border-t border-gray-100 pt-6">
        <Button type="submit" loading={saving}>Continuar</Button>
      </div>
    </form>
  );
}
