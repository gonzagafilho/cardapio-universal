import { API_BASE_URL } from '@/lib/constants';

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, unknown>;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: ApiError = {
      message: (data as { message?: string }).message ?? 'Erro na requisição',
      statusCode: res.status,
      errors: (data as { errors?: Record<string, unknown> }).errors,
    };
    throw err;
  }
  return (data as { data?: T }).data ?? (data as T);
}

export async function apiGet<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: 'DELETE',
    headers: options?.headers,
  });
  return handleResponse<T>(res);
}
