'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { getCategories, createCategory } from '@/services/category.service';
import type { Category } from '@/types/category';

/** Categorias sugeridas por tipo de negócio (hub /comecar). Chaves devem bater com businessType. */
const CATEGORIAS_POR_TIPO: Record<string, string[]> = {
  Hamburgueria: ['Hambúrgueres', 'Combos', 'Bebidas', 'Porções'],
  Pizzaria: ['Pizzas tradicionais', 'Pizzas especiais', 'Bebidas', 'Sobremesas'],
  Lanchonete: ['Lanches', 'Combos', 'Bebidas', 'Porções'],
  'Açaí': ['Açaís', 'Complementos', 'Bebidas', 'Combos'],
  Cafeteria: ['Cafés', 'Salgados', 'Doces', 'Bebidas geladas'],
  Restaurante: ['Entradas', 'Pratos principais', 'Bebidas', 'Sobremesas'],
};

const SUGESTOES = ['Entradas', 'Principais', 'Bebidas', 'Sobremesas', 'Combos', 'Lanches'];

export function SetupStepCategories({
  establishmentId,
  businessType,
  onNext,
  onBack,
}: {
  establishmentId: string;
  businessType?: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyingSuggested, setApplyingSuggested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedByType = businessType?.trim() ? CATEGORIAS_POR_TIPO[businessType.trim()] : undefined;

  useEffect(() => {
    getCategories(establishmentId)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, [establishmentId]);

  const addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    setSaving(true);
    try {
      const created = await createCategory({ name: trimmed }, establishmentId);
      setCategories((prev) => [...prev, created]);
      setNewName('');
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Erro ao criar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory(newName);
  };

  const addSuggestion = (name: string) => {
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    addCategory(name);
  };

  const applySuggestedCategories = async () => {
    if (!suggestedByType?.length) return;
    setError(null);
    setApplyingSuggested(true);
    try {
      const existingNames = new Set(categories.map((c) => c.name.toLowerCase()));
      for (const name of suggestedByType) {
        if (existingNames.has(name.toLowerCase())) continue;
        const created = await createCategory({ name: name.trim() }, establishmentId);
        existingNames.add(created.name.toLowerCase());
        setCategories((prev) => [...prev, created]);
      }
      const refreshed = await getCategories(establishmentId);
      setCategories(refreshed);
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Erro ao criar categorias sugeridas');
    } finally {
      setApplyingSuggested(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Carregando categorias...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Categorias</h2>
        <p className="mt-1 text-sm text-gray-500">
          Crie categorias para organizar seus produtos (ex.: Entradas, Principais, Bebidas).
        </p>
      </div>

      {suggestedByType && suggestedByType.length > 0 && (
        <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-5">
          <p className="mb-3 text-sm font-semibold text-gray-900">
            Categorias sugeridas para seu tipo de negócio
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {suggestedByType.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-lg bg-white/80 px-3 py-1.5 text-sm font-medium text-primary shadow-sm ring-1 ring-primary/20"
              >
                {name}
              </span>
            ))}
          </div>
          <Button
            type="button"
            onClick={applySuggestedCategories}
            loading={applyingSuggested}
            disabled={applyingSuggested}
            className="w-full sm:w-auto"
          >
            Usar categorias sugeridas
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Sugestões rápidas</p>
        <div className="flex flex-wrap gap-2">
          {SUGESTOES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => addSuggestion(name)}
              disabled={categories.some((c) => c.name.toLowerCase() === name.toLowerCase())}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              + {name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Nova categoria"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" loading={saving} disabled={!newName.trim()}>
          Adicionar
        </Button>
      </form>

      {categories.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
            Suas categorias ({categories.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between border-t border-gray-100 pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="button" onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
