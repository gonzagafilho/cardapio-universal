'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CreateEstablishmentDto } from '@/types/establishment';

export function EstablishmentForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<CreateEstablishmentDto>;
  onSubmit: (dto: CreateEstablishmentDto) => void;
  loading?: boolean;
}) {
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [slug, setSlug] = useState(defaultValues?.slug ?? '');
  const [phone, setPhone] = useState(defaultValues?.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(defaultValues?.whatsapp ?? '');
  const [email, setEmail] = useState(defaultValues?.email ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [address, setAddress] = useState(defaultValues?.address ?? '');
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      phone,
      whatsapp,
      email,
      description,
      address,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-amigavel" />
      <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
      <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className="text-sm">Ativo</span>
      </label>
      <Button type="submit" loading={loading}>
        Salvar
      </Button>
    </form>
  );
}
