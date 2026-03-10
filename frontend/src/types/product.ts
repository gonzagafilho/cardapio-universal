export interface ProductOptionItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  sortOrder: number;
  items: ProductOptionItem[];
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  promotionalPrice?: number | null;
  sku?: string | null;
  isActive: boolean;
  isAvailable?: boolean;
  isFeatured?: boolean;
  sortOrder: number;
  categoryId: string;
  category?: { id: string; name: string };
  optionGroups?: ProductOptionGroup[];
}
