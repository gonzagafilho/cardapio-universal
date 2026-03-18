export type Table = {
  id: string;
  name: string;
  number?: string | null;
  token?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type CreateTableDto = {
  name: string;
  number?: string;
};

