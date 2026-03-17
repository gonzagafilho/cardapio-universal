'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { getCategories } from '@/services/category.service';
import { getProducts, createProduct } from '@/services/product.service';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';

export function SetupStepProducts({
  establishmentId,
  onNext,
  onBack,
}: {
  establishmentId: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories(establishmentId).then(setCategories).catch(() => setCategories([]));
    getProducts(establishmentId).then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [establishmentId]);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price.replace(',', '.'));
    if (!name.trim() || isNaN(priceNum) || priceNum < 0 || !categoryId) {
      setError('Preencha nome, preço e categoria.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const created = await createProduct(
        { name: name.trim(), price: priceNum, description: description.trim() || undefined, categoryId, imageUrl: imageUrl.trim() || undefined },
        establishmentId,
      );
      setProducts((prev) => [...prev, created]);
      setName('');
      setPrice('');
      setDescription('');
      setImageUrl('');
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Erro ao criar produto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Produtos</h2>
        <p className="mt-1 text-sm text-gray-500">Adicione itens ao cardápio.</p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Crie categorias no passo anterior antes de adicionar produtos.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-500">Novo produto</p>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: X-Tudo" />
                <Input label="Preço (R$)" type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" />
              </div>
              <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Opcional" />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Input label="URL da foto (opcional)" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              <Button type="submit" loading={saving}>Adicionar produto</Button>
            </form>
          </div>
          {products.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                Seus produtos ({products.length})
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {products.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-400">?</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-600">R$ {Number(p.price).toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="flex justify-between border-t border-gray-100 pt-6">
        <Button type="button" variant="outline" onClick={onBack}>Voltar</Button>
        <Button type="button" onClick={onNext}>Continuar</Button>
      </div>
    </div>
  );
}
