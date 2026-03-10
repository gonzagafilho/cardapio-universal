export interface Establishment {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  customDomain: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEstablishmentDto {
  name: string;
  slug: string;
  customDomain?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive?: boolean;
}

export interface UpdateEstablishmentDto extends Partial<CreateEstablishmentDto> {}
