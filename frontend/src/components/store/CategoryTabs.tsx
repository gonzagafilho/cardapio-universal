'use client';

import { cn } from '@/lib/cn';
import type { Category } from '@/types/category';

export interface CategoryTabsProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
}

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
  className,
}: CategoryTabsProps) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-2 scrollbar-thin',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
          activeId === null
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            activeId === cat.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
