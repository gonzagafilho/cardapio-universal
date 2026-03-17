'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CommercialLayout } from '@/components/commercial/CommercialLayout';
import { ADMIN_URL, APP_URL } from '@/lib/constants';
import { COMMERCIAL_PLANS } from '@/lib/plans-commercial';
import { registerOnboarding, type OnboardingPayload } from '@/services/auth.service';

type PlanKey = 'basic' | 'pro' | 'enterprise';

const STEPS = [
  { id: 1, title: 'Empresa' },
  { id: 2, title: 'Loja' },
  { id: 3, title: 'Acesso' },
  { id: 4, title: 'Confirmar' },
] as const;

function slugFromText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function ComecarPage() {
  const [step, setStep] = useState<number>(1);
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

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('pro');

  const [successCardUrl, setSuccessCardUrl] = useState<string | null>(null);
  const [successStoreName, setSuccessStoreName] = useState<string>('');
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<
    | 'Hamburgueria'
    | 'Pizzaria'
    | 'Lanchonete'
    | 'Açaí'
    | 'Cafeteria'
    | 'Restaurante'
    | 'Outro'
  >('Restaurante');

  const BUSINESS_TYPES: Array<{
    key: typeof businessType;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'Hamburgueria',
      label: 'Hamburgueria',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M7 11h10" />
          <path d="M6 15h12" />
          <path d="M6 19h12" />
          <path d="M7 7c.5-2 2.5-3 5-3s4.5 1 5 3" />
        </svg>
      ),
    },
    {
      key: 'Pizzaria',
      label: 'Pizzaria',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2c5.5 0 10 4.5 10 10" />
          <path d="M12 2C6.5 2 2 6.5 2 12" />
          <path d="M12 2l8.5 18H3.5L12 2z" />
          <path d="M8.5 13.5h.01" />
          <path d="M14.5 11.5h.01" />
          <path d="M12 16h.01" />
        </svg>
      ),
    },
    {
      key: 'Lanchonete',
      label: 'Lanchonete',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 8h12" />
          <path d="M7 12h10" />
          <path d="M8 16h8" />
          <path d="M8 8c0-2 2-4 4-4s4 2 4 4" />
          <path d="M6 20h12" />
        </svg>
      ),
    },
    {
      key: 'Açaí',
      label: 'Açaí',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M8 3h8" />
          <path d="M7 3l1 18h8l1-18" />
          <path d="M9 9h6" />
        </svg>
      ),
    },
    {
      key: 'Cafeteria',
      label: 'Cafeteria',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 8h11v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
          <path d="M15 10h2a3 3 0 0 1 0 6h-2" />
          <path d="M6 3c0 2 1 2 1 4" />
          <path d="M10 3c0 2 1 2 1 4" />
          <path d="M14 3c0 2 1 2 1 4" />
        </svg>
      ),
    },
    {
      key: 'Restaurante',
      label: 'Restaurante',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M7 2v8" />
          <path d="M7 10a3 3 0 0 1 0-8" />
          <path d="M17 2v20" />
          <path d="M14 6h6" />
        </svg>
      ),
    },
    {
      key: 'Outro',
      label: 'Outro',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 20h.01" />
          <path d="M9.1 9a3 3 0 1 1 5.8 1c-.6 1.2-1.9 1.6-2.4 2.8-.2.5-.2 1-.2 1.2" />
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
        </svg>
      ),
    },
  ];

  const normalizedStoreSlug = useMemo(
    () => (storeSlug.trim() ? slugFromText(storeSlug) : slugFromText(storeName)),
    [storeSlug, storeName],
  );

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value);
    if (!companySlug.trim()) {
      setCompanySlug(slugFromText(value));
    }
  };

  const handleStoreNameChange = (value: string) => {
    setStoreName(value);
    if (!storeSlug.trim()) {
      setStoreSlug(slugFromText(value));
    }
  };

  const canNextStep1 = companyName.trim().length >= 2 && slugFromText(companySlug).length >= 2;
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
        companySlug: slugFromText(companySlug),
        ownerName: ownerName.trim(),
        email: email.trim().toLowerCase(),
        password,
        storeName: storeName.trim(),
        storeSlug: normalizedStoreSlug || undefined,
        phone: phone.trim() || undefined,
        storeDescription: storeDescription.trim() || undefined,
        plan: selectedPlan,
      };

      const response = await registerOnboarding(payload);

      setSuccessStoreName(payload.storeName);
      setSuccessCardUrl(response.publicCardUrl ?? `/${payload.storeSlug ?? normalizedStoreSlug}`);
      const token = (response as { accessToken?: string }).accessToken ?? (response as { tokens?: { accessToken?: string } }).tokens?.accessToken;
      const refresh = (response as { tokens?: { refreshToken?: string } }).tokens?.refreshToken ?? '';
      if (token) {
        setSetupUrl(
          `${ADMIN_URL}/setup#accessToken=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refresh)}`,
        );
      }
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Falha ao criar sua conta';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (successCardUrl) {
    const publicCardHref = successCardUrl.startsWith('http')
      ? successCardUrl
      : `${APP_URL}${successCardUrl.startsWith('/') ? '' : '/'}${successCardUrl}`;
    const setupHref = setupUrl
      ? `${setupUrl}&businessType=${encodeURIComponent(businessType)}`
      : null;

    return (
      <CommercialLayout>
        <section className="border-b border-gray-200 bg-gray-50/80 py-12 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="relative overflow-hidden rounded-[2.2rem] border border-gray-200 bg-white p-8 shadow-[0_28px_90px_rgba(0,0,0,0.10)] sm:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.05),transparent_40%)]" />
                <div className="relative">
                  <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-lg font-semibold text-white">
                    ✓
                  </div>

                  <h1 className="mt-6 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                    Sua conta foi criada com sucesso
                  </h1>

                  <p className="mt-3 text-base leading-7 text-gray-600 sm:text-lg">
                    O cardápio inicial da loja <strong>{successStoreName}</strong> já foi criado.
                  </p>

                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-left">
                    <p className="text-sm font-semibold text-emerald-950">Boas-vindas!</p>
                    <p className="mt-1 text-sm text-emerald-900/80">
                      Você tem <strong>7 dias grátis</strong> para configurar e publicar seu cardápio. Após o trial, assine no painel (Assinatura) com pagamento seguro no Mercado Pago.
                    </p>
                  </div>

                  <div className="mt-6 text-left">
                    <p className="text-sm font-semibold text-gray-900">Qual é o tipo do seu negócio?</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Isso ajuda a sugerir categorias e acelerar a configuração.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {BUSINESS_TYPES.map((t) => {
                        const active = t.key === businessType;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setBusinessType(t.key)}
                            className={[
                              'flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition',
                              active
                                ? 'border-black bg-black text-white shadow-sm'
                                : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
                            ].join(' ')}
                          >
                            <span className={active ? 'text-white' : 'text-gray-700'}>{t.icon}</span>
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">O que acontece agora</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Escolhendo o tipo do seu negócio, vamos sugerir categorias para acelerar sua configuração.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    {setupHref ? (
                      <a
                        href={setupHref}
                        className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-black px-8 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.14)] transition hover:bg-gray-800"
                      >
                        Começar configuração
                      </a>
                    ) : null}

                    <a
                      href={publicCardHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                    >
                      Abrir meu cardápio
                    </a>

                    <Link
                      href="/planos"
                      className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                    >
                      Ver planos
                    </Link>
                    {setupHref && (
                      <a
                        href={`${ADMIN_URL.replace(/\/$/, '')}/billing`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                      >
                        Assinar plano no painel (depois)
                      </a>
                    )}
                  </div>

                  <div className="mt-7 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-left text-sm text-gray-700">
                    <p className="font-medium text-gray-900">Link público do seu cardápio</p>
                    <p className="mt-2 break-all font-mono text-[13px]">{successCardUrl}</p>
                  </div>

                  <p className="mt-6 text-xs text-gray-500">
                    Você pode abrir o cardápio agora, mas recomendamos completar a configuração para deixar tudo pronto. Após os 7 dias grátis, configure o pagamento em Assinatura no painel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </CommercialLayout>
    );
  }

  return (
    <CommercialLayout>
      <section className="border-b border-gray-200 bg-gray-50/80 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1fr_520px]">
            <div className="hidden lg:block">
              <div className="max-w-2xl pt-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 shadow-sm">
                  <span className="inline-flex h-2 w-2 rounded-full bg-black" />
                  Cadastro do cliente
                </div>

                <h1 className="mt-6 text-5xl font-semibold tracking-tight text-black">
                  Crie sua conta e coloque seu cardápio no ar.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                  Cadastre sua empresa, sua primeira loja e seu acesso em poucos passos.
                  <strong className="text-gray-900"> 7 dias grátis</strong>, sem cartão para começar. Após o trial, assine no painel quando quiser.
                </p>

                <div className="mt-10 space-y-4 max-w-xl">
                  {[
                    '7 dias grátis — não pedimos cartão para você começar',
                    'Criação automática da empresa e do primeiro estabelecimento',
                    'Categorias iniciais prontas para você começar a editar',
                    'URL pública do cardápio gerada automaticamente',
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

                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                  <p className="text-sm font-bold text-emerald-900">Teste grátis por 7 dias</p>
                  <p className="mt-1 text-xs text-emerald-800/90">
                    Configure e publique seu restaurante durante o período. <strong>Sem cartão para começar.</strong> Após o trial, você assina o plano escolhido no painel, com pagamento seguro no Mercado Pago.
                  </p>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Escolha seu plano (por quantidade de restaurantes)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {COMMERCIAL_PLANS.map((plan) => {
                      const isSelected = selectedPlan === plan.key;
                      return (
                        <button
                          key={plan.key}
                          type="button"
                          onClick={() => setSelectedPlan(plan.key as PlanKey)}
                          className={[
                            'relative rounded-xl border p-3 text-left transition',
                            isSelected
                              ? 'border-black bg-black text-white shadow-md'
                              : 'border-gray-200 bg-white text-black hover:border-gray-300 hover:bg-gray-50',
                          ].join(' ')}
                        >
                          {plan.recommended && (
                            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                              Recomendado
                            </span>
                          )}
                          <p className="font-semibold text-sm">{plan.name}</p>
                          <p className="mt-0.5 text-xs opacity-80">{plan.price}</p>
                          <p className="mt-1 text-[10px] opacity-70">Até {plan.restaurantCount} restaurante{plan.restaurantCount > 1 ? 's' : ''}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-4 gap-2">
                  {STEPS.map((s) => (
                    <div key={s.id} className="space-y-2 text-center">
                      <div
                        className={`h-2 rounded-full transition ${
                          step === s.id ? 'bg-black' : step > s.id ? 'bg-gray-400' : 'bg-gray-200'
                        }`}
                      />
                      <p className={`text-xs font-medium ${step === s.id ? 'text-black' : 'text-gray-500'}`}>
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
                        label="Slug da empresa"
                        required
                        value={companySlug}
                        onChange={(e) => setCompanySlug(slugFromText(e.target.value))}
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
                        placeholder="Minha Hamburgueria"
                      />
                      <Input
                        label="Slug do cardápio público"
                        value={storeSlug}
                        onChange={(e) => setStoreSlug(slugFromText(e.target.value))}
                        placeholder="minha-hamburgueria"
                      />
                      <Input
                        label="Telefone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                      <Input
                        label="Descrição da loja"
                        value={storeDescription}
                        onChange={(e) => setStoreDescription(e.target.value)}
                        placeholder="Descreva brevemente seu negócio"
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
                          <strong>Plano:</strong>{' '}
                          {(() => {
                            const p = COMMERCIAL_PLANS.find((x) => x.key === selectedPlan);
                            const c = p?.restaurantCount ?? 1;
                            return `${p?.name ?? selectedPlan} (inclui até ${c} restaurante${c > 1 ? 's' : ''}) — 7 dias grátis`;
                          })()}
                        </p>
                        <p>
                          <strong>Empresa:</strong> {companyName} ({slugFromText(companySlug)})
                        </p>
                        <p>
                          <strong>Loja:</strong> {storeName} ({normalizedStoreSlug})
                        </p>
                        <p>
                          <strong>Responsável:</strong> {ownerName} — {email}
                        </p>
                        {phone ? (
                          <p>
                            <strong>Telefone:</strong> {phone}
                          </p>
                        ) : null}
                      </div>
                      <p className="mt-4 text-gray-500">
                        Ao confirmar, sua conta será criada com <strong>7 dias grátis</strong> (sem cartão). Após o trial, assine no painel em Assinatura. Sua URL pública será gerada automaticamente.
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
                        <Link href="/planos">
                          <Button type="button" variant="ghost" className="rounded-2xl">
                            Ver planos
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
                            if (step === 2 && canNextStep2) setStep(3);
                            if (step === 3 && canNextStep3) setStep(4);
                          }}
                        >
                          Continuar
                        </Button>
                      ) : (
                        <Button type="submit" loading={loading} className="rounded-2xl">
                          Criar minha conta
                        </Button>
                      )}
                    </div>
                  </div>
                </form>

                <p className="mt-6 text-center text-xs text-gray-500">
                  Comece agora com <strong>7 dias grátis</strong>, sem cartão. Após o trial, assine o plano escolhido no painel (pagamento seguro no Mercado Pago).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CommercialLayout>
  );
}