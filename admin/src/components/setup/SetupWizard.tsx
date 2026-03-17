'use client';

import { useState, useEffect } from 'react';
import { getEstablishment } from '@/services/establishment.service';
import { getCategories } from '@/services/category.service';
import { getProducts } from '@/services/product.service';
import type { Establishment } from '@/types/establishment';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import { SetupProgress } from './SetupProgress';
import { SetupPreview } from './SetupPreview';
import { SetupStepInfo } from './steps/SetupStepInfo';
import { SetupStepLogo } from './steps/SetupStepLogo';
import { SetupStepCategories } from './steps/SetupStepCategories';
import { SetupStepProducts } from './steps/SetupStepProducts';
import { SetupStepOrders } from './steps/SetupStepOrders';
import { SetupStepPublish } from './steps/SetupStepPublish';

const STEPS = [
  { id: 1, title: 'Informações do restaurante' },
  { id: 2, title: 'Logo e capa' },
  { id: 3, title: 'Categorias' },
  { id: 4, title: 'Produtos' },
  { id: 5, title: 'Configuração de pedidos' },
  { id: 6, title: 'Publicar restaurante' },
] as const;

export function SetupWizard({
  establishmentId,
  initialBusinessType,
}: {
  establishmentId: string;
  initialBusinessType?: string;
}) {
  const [step, setStep] = useState(1);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [bizType, setBizType] = useState<string>(initialBusinessType?.trim() ?? '');
  const [previewCategories, setPreviewCategories] = useState<Category[]>([]);
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);

  useEffect(() => {
    setBizType(initialBusinessType?.trim() ?? '');
  }, [initialBusinessType]);

  useEffect(() => {
    getEstablishment(establishmentId)
      .then(setEstablishment)
      .catch(() => setEstablishment(null))
      .finally(() => setLoading(false));
  }, [establishmentId]);

  useEffect(() => {
    if (step >= 3) {
      getCategories(establishmentId).then(setPreviewCategories).catch(() => setPreviewCategories([]));
    }
    if (step >= 4) {
      getProducts(establishmentId).then(setPreviewProducts).catch(() => setPreviewProducts([]));
    }
  }, [establishmentId, step]);

  const refreshEstablishment = () => {
    getEstablishment(establishmentId).then(setEstablishment);
  };

  if (loading || !establishment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Configuração do restaurante
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Preencha os passos abaixo para deixar seu cardápio pronto para vender.
        </p>
      </div>

      <SetupProgress steps={STEPS} currentStep={step} />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-8">
            {step === 1 && (
              <SetupStepInfo
                establishment={establishment}
                initialBusinessType={bizType}
                onSaved={refreshEstablishment}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <SetupStepLogo
                establishment={establishment}
                onSaved={refreshEstablishment}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <SetupStepCategories
                establishmentId={establishmentId}
                businessType={bizType}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <SetupStepProducts
                establishmentId={establishmentId}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}
            {step === 5 && (
              <SetupStepOrders
                establishmentId={establishmentId}
                onNext={() => setStep(6)}
                onBack={() => setStep(4)}
              />
            )}
            {step === 6 && (
              <SetupStepPublish establishment={establishment} onBack={() => setStep(5)} />
            )}
          </div>
        </div>
        <aside className="lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-8">
            <SetupPreview
              establishment={establishment}
              categories={previewCategories}
              products={previewProducts}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
