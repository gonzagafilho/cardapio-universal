import Link from 'next/link';
import { ADMIN_URL } from '@/lib/constants';

export function CommercialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">Nexora</Link>
          <nav className="flex items-center gap-6">
            <Link href="/planos" className="text-sm font-medium text-gray-600 hover:text-gray-900">Planos</Link>
            <Link href={`${ADMIN_URL}/login`} className="text-sm font-medium text-gray-600 hover:text-gray-900">Entrar</Link>
            <Link href={`${ADMIN_URL}/onboarding`} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">Criar conta</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="font-semibold text-gray-900">Nexora</p>
          <p className="mt-1 text-sm text-gray-600">Cardápio digital profissional.</p>
          <div className="mt-4 flex gap-6 text-sm">
            <Link href="/planos" className="text-gray-600 hover:text-gray-900">Planos</Link>
            <a href={`${ADMIN_URL}/login`} className="text-gray-600 hover:text-gray-900">Entrar</a>
            <a href={`${ADMIN_URL}/onboarding`} className="text-gray-600 hover:text-gray-900">Criar conta</a>
          </div>
          <p className="mt-6 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} Nexora</p>
        </div>
      </footer>
    </div>
  );
}
