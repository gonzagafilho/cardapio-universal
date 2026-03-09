import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user';

export async function getUsers(): Promise<User[]> {
  return apiGet<User[]>('/users');
}

export async function getUser(id: string): Promise<User> {
  return apiGet<User>(`/users/${id}`);
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  return apiPost<User>('/users', dto);
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {
  return apiPatch<User>(`/users/${id}`, dto);
}

export async function deleteUser(id: string): Promise<void> {
  return apiDelete(`/users/${id}`);
}
