'use client';

import { APP_PUBLIC_URL } from '@/lib/constants';
import type { Establishment } from '@/types/establishment';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';

export function SetupPreview({
  establishment,
  categories = [],
  products = [],
}: {
  establishment: Establishment;
  categories?: Category[];
  products?: Product[];
}) {
  const publicUrl = establishment.slug
    ? `${APP_PUBLIC_URL}/${establishment.slug}`
    : null;
  const tipo = establishment.description?.split(' — ')[0]?.trim() || 'Seu negócio';
  const logoUrl = establishment.logoUrl || 'https://placehold.co/80x80/e5e7eb/9ca3af?text=Logo';
  const bannerUrl = establishment.bannerUrl || 'https://placehold.co/400x120/e5e7eb/9ca3af?text=Capa';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
      <p className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Preview do cardápio
      </p>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt="Logo"
            className="h-14 w-14 shrink-0 rounded-xl object-cover border border-gray-200"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {establishment.name || 'Nome do restaurante'}
            </p>
            <p className="text-xs text-gray-500">{tipo}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[400/120] bg-gray-100">
          <img
            src={bannerUrl}
            alt="Capa"
            className="h-full w-full object-cover"
          />
        </div>
        {categories.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Categorias</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 8).map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {c.name}
                </span>
              ))}
              {categories.length > 8 && (
                <span className="text-xs text-gray-400">+{categories.length - 8}</span>
              )}
            </div>
          </div>
        )}
        {products.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Produtos</p>
            <ul className="space-y-1.5">
              {products.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="h-8 w-8 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <span className="h-8 w-8 shrink-0 rounded-md bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">?</span>
                  )}
                  <span className="text-gray-900 truncate flex-1">{p.name}</span>
                  <span className="text-gray-600 font-medium">R$ {Number(p.price).toFixed(2)}</span>
                </li>
              ))}
              {products.length > 5 && (
                <li className="text-xs text-gray-400">+{products.length - 5} mais</li>
              )}
            </ul>
          </div>
        )}
        {publicUrl && (
          <p className="text-xs text-gray-500 truncate pt-1 border-t border-gray-100" title={publicUrl}>
            {publicUrl}
          </p>
        )}
      </div>
    </div>
  );
}
