'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { OnboardingPayload } from '@/services/auth.service';

const STEPS = [
  { id: 1, title: 'Dados da empresa' },
  { id: 2, title: 'Dados da loja' },
  { id: 3, title: 'Seu acesso' },
  { id: 4, title: 'Confirmação' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { registerOnboarding, user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [authLoading, user, router]);

  const slugFromName = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value);
    if (!storeName) setCompanySlug(slugFromName(value));
  };

  const handleStoreNameChange = (value: string) => {
    setStoreName(value);
    if (step >= 2 && !storeSlug) setStoreSlug(slugFromName(value));
  };

  const canNextStep1 = companyName.trim().length >= 2 && companySlug.trim().length >= 2;
  const canNextStep2 = storeName.trim().length >= 2;
  const canNextStep3 =
    ownerName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: OnboardingPayload = {
        companyName: companyName.trim(),
        companySlug: companySlug.trim().toLowerCase().replace(/\s+/g, '-'),
        ownerName: ownerName.trim(),
        email: email.trim().toLowerCase(),
        password,
        storeName: storeName.trim(),
        storeSlug: storeSlug.trim() || undefined,
        phone: phone.trim() || undefined,
        storeDescription: storeDescription.trim() || undefined,
      };
      await registerOnboarding(payload);
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? Array.isArray((err as { message: unknown }).message)
            ? (err as { message: string[] }).message.join(' ')
            : String((err as { message: string }).message)
          : 'Falha no cadastro';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-center text-xl font-bold text-gray-900">
          Criar minha conta
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Configure sua empresa e sua primeira loja em poucos passos
        </p>

        <div className="mt-6 flex justify-between gap-2">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex-1 rounded py-1 text-center text-xs font-medium ${
                step === s.id
                  ? 'bg-primary text-white'
                  : step > s.id
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {s.id}
            </div>
          ))}
        </div>

        <form onSubmit={step < 4 ? (e) => { e.preventDefault(); } : handleSubmit} className="mt-6 space-y-4">
          {step === 1 && (
            <>
              <Input
                label="Nome da empresa"
                required
                value={companyName}
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                placeholder="Minha Empresa"
              />
              <Input
                label="Slug da empresa (URL)"
                required
                value={companySlug}
                onChange={(e) => setCompanySlug(e.target.value)}
                placeholder="minha-empresa"
              />
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label="Nome da loja / estabelecimento"
                required
                value={storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                placeholder="Minha Loja"
              />
              <Input
                label="Slug do cardápio público"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                placeholder="minha-loja"
              />
              <Input
                label="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
              <Textarea
                label="Descrição (opcional)"
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="Breve descrição da loja"
                rows={2}
              />
            </>
          )}

          {step === 3 && (
            <>
              <Input
                label="Seu nome"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="João Silva"
              />
              <Input
                label="E-mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
              />
              <Input
                label="Senha (mín. 6 caracteres)"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}

          {step === 4 && (
            <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
              <p><strong>Empresa:</strong> {companyName} ({companySlug})</p>
              <p><strong>Loja:</strong> {storeName} ({storeSlug || slugFromName(storeName)})</p>
              <p><strong>Responsável:</strong> {ownerName} — {email}</p>
              <p className="text-gray-600">Após confirmar, você entrará no painel.</p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                Voltar
              </Button>
            ) : (
              <Link href="/login">
                <Button type="button" variant="ghost">Já tenho conta</Button>
              </Link>
            )}
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 1 && canNextStep1) setStep(2);
                  else if (step === 2 && canNextStep2) setStep(3);
                  else if (step === 3 && canNextStep3) setStep(4);
                }}
                disabled={
                  (step === 1 && !canNextStep1) ||
                  (step === 2 && !canNextStep2) ||
                  (step === 3 && !canNextStep3)
                }
              >
                Próximo
              </Button>
            ) : (
              <Button type="submit" loading={loading}>
                Criar conta e entrar
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
