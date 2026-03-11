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
          'shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200',
          activeId === null
            ? 'bg-gray-900 text-white shadow-sm'
            : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300 hover:text-gray-900'
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
            'shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200',
            activeId === cat.id
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300 hover:text-gray-900'
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
