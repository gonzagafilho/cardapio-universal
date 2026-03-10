export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    establishments: number;
    users: number;
  };
}

export interface UpdateTenantDto {
  name?: string;
  slug?: string;
  plan?: string;
  status?: string;
}
