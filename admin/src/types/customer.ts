export interface Customer {
  id: string;
  tenantId: string;
  establishmentId: string;
  name: string;
  phone: string;
  email: string | null;
  cpf: string | null;
  createdAt: string;
  updatedAt: string;
}
