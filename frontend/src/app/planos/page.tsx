import Link from 'next/link';
import { ADMIN_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { CommercialLayout } from '@/components/commercial/CommercialLayout';
import { COMMERCIAL_PLANS } from '@/lib/plans-commercial';

export default function PlanosPage() {
  return (
    <CommercialLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Planos Nexora</h1>
          <p className="mt-2 text-gray-600">Escolha o plano ideal para o seu negócio.</p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {COMMERCIAL_PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-xl border-2 bg-white p-6 shadow-sm ${
                plan.recommended ? 'border-primary' : 'border-gray-200'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-white">
                  Recomendado
                </span>
              )}
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <p className="mt-2 text-2xl font-semibold text-primary">{plan.price}</p>
              <ul className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href={`${ADMIN_URL}/onboarding`}>
                  <Button size="lg" className="w-full" variant={plan.recommended ? 'primary' : 'outline'}>
                    Começar agora
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          Já tem conta? <a href={`${ADMIN_URL}/login`} className="font-medium text-primary hover:underline">Entrar</a>
        </p>
      </div>
    </CommercialLayout>
  );
}
