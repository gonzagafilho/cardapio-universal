export interface ProductOptionItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductOptionGroup {
  id: string;
  productId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  sortOrder: number;
  items: ProductOptionItem[];
}

export interface Product {
  id: string;
  tenantId: string;
  establishmentId: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  promotionalPrice: number | null;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string };
  optionGroups?: ProductOptionGroup[];
}

export interface CreateProductDto {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  promotionalPrice?: number;
  sku?: string;
  categoryId: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
