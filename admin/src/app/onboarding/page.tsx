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
  { id: 1, title: 'Empresa' },
  { id: 2, title: 'Loja' },
  { id: 3, title: 'Acesso' },
  { id: 4, title: 'Confirmar' },
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
    if (!companySlug) setCompanySlug(slugFromName(value));
  };

  const handleStoreNameChange = (value: string) => {
    setStoreName(value);
    if (!storeSlug) setStoreSlug(slugFromName(value));
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_32%)]" />
      <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gray-100/70 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-start gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8 lg:py-14">
        <div className="hidden lg:block">
          <div className="max-w-2xl pt-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 shadow-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-black" />
              Nexora onboarding
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-black">
              Coloque sua operação no ar com uma estrutura profissional.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Configure sua empresa, sua primeira loja e seu acesso em poucos passos.
              Em seguida, você entra no painel pronto para começar a vender melhor.
            </p>

            <div className="mt-10 space-y-4 max-w-xl">
              {[
                'Crie sua empresa e organize sua estrutura',
                'Configure sua primeira loja e o cardápio público',
                'Entre no painel e continue a operação',
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-4 rounded-[1.75rem] border border-gray-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-gray-200 bg-white p-7 shadow-[0_25px_80px_rgba(0,0,0,0.10)] sm:p-8">
            <div className="text-center">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-black shadow-sm">
                N
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-black">
                Criar minha conta
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Configure sua empresa e sua primeira loja em poucos minutos.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-2">
              {STEPS.map((s) => (
                <div key={s.id} className="space-y-2 text-center">
                  <div
                    className={`h-2 rounded-full transition ${
                      step === s.id
                        ? 'bg-black'
                        : step > s.id
                          ? 'bg-gray-400'
                          : 'bg-gray-200'
                    }`}
                  />
                  <p
                    className={`text-xs font-medium ${
                      step === s.id ? 'text-black' : 'text-gray-500'
                    }`}
                  >
                    {s.title}
                  </p>
                </div>
              ))}
            </div>

            <form
              onSubmit={step < 4 ? (e) => e.preventDefault() : handleSubmit}
              className="mt-8 space-y-4"
            >
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
                    label="Descrição da loja"
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    placeholder="Breve descrição da sua loja"
                    rows={3}
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
                    label="Senha"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                  />
                </>
              )}

              {step === 4 && (
                <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 text-sm">
                  <p className="text-base font-semibold text-black">Confirme seus dados</p>
                  <div className="mt-4 space-y-2 text-gray-700">
                    <p>
                      <strong>Empresa:</strong> {companyName} ({companySlug})
                    </p>
                    <p>
                      <strong>Loja:</strong> {storeName} ({storeSlug || slugFromName(storeName)})
                    </p>
                    <p>
                      <strong>Responsável:</strong> {ownerName} — {email}
                    </p>
                  </div>
                  <p className="mt-4 text-gray-500">
                    Ao confirmar, sua conta será criada e você seguirá para o painel.
                  </p>
                </div>
              )}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <div>
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => setStep((s) => s - 1)}
                    >
                      Voltar
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button type="button" variant="ghost" className="rounded-2xl">
                        Já tenho conta
                      </Button>
                    </Link>
                  )}
                </div>

                <div>
                  {step < 4 ? (
                    <Button
                      type="button"
                      className="rounded-2xl"
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
                      Próximo passo
                    </Button>
                  ) : (
                    <Button type="submit" loading={loading} className="rounded-2xl">
                      Criar conta e entrar
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}