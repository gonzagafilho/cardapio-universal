import { API_BASE_URL, TOKEN_KEY } from '@/lib/constants';

export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  errors?: Record<string, unknown>;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = (data as { code?: string }).code;
    const err: ApiError = {
      message: (data as { message?: string }).message ?? 'Erro na requisição',
      statusCode: res.status,
      code,
      errors: (data as { errors?: Record<string, unknown> }).errors,
    };
    // TRIAL_EXPIRED is not logout: do not clear token/user or redirect to /login.
    // Only notify layout to redirect to /billing; session stays valid.
    if (res.status === 403 && code === 'TRIAL_EXPIRED' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trialExpired'));
    }
    throw err;
  }
  return (data as { data?: T }).data ?? (data as T);
}

export async function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPostFormData<T>(
  path: string,
  formData: FormData,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options?.headers ?? {}),
    },
    body: formData,
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: 'DELETE',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  return handleResponse<T>(res);
}
