'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? Array.isArray((err as { message: unknown }).message)
            ? (err as { message: string[] }).message.join(' ')
            : String((err as { message: string }).message)
          : 'Falha no login';

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

  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_32%)]" />
      <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gray-100/70 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div className="hidden lg:block">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 shadow-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-black" />
              Nexora Admin
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-black">
              Controle sua operação com um painel profissional.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Gerencie produtos, categorias, pedidos, clientes e pagamentos em um painel
              moderno, rápido e pensado para vender melhor.
            </p>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              {[
                { title: 'Cardápio online', text: 'Edite e publique com rapidez' },
                { title: 'QR Code', text: 'Entrega simples para o cliente' },
                { title: 'Painel central', text: 'Tudo organizado em um lugar' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                >
                  <p className="text-base font-semibold text-black">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-gray-200 bg-white p-7 shadow-[0_25px_80px_rgba(0,0,0,0.10)] sm:p-8">
            <div className="text-center">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-black shadow-sm">
                N
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-black">
                Entrar no painel
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Acesse sua conta e continue a configurar sua operação.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              />

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button type="submit" fullWidth loading={loading} className="rounded-2xl">
                Entrar no painel
              </Button>

              <div className="pt-2 text-center text-sm text-gray-600">
                Ainda não tem conta?{' '}
                <Link href="/onboarding" className="font-semibold text-black hover:underline">
                  Criar minha conta
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}