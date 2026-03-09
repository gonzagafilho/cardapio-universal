import type { Role } from './auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  establishmentId: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
  establishmentId?: string;
  isActive?: boolean;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}
