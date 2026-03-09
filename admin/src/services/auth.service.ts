import { apiGet, apiPost } from './api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@/lib/constants';
import type { AuthResponse, UserSession } from '@/types/auth';

/** Resposta do backend GET /auth/me (pode incluir tenant/establishment) */
interface MeApiResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  establishmentId?: string | null;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiPost<AuthResponse & { ok?: boolean; accessToken?: string }>('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });
  if (typeof window !== 'undefined' && (res?.accessToken ?? res?.tokens?.accessToken)) {
    const token = res.accessToken ?? res.tokens?.accessToken;
    localStorage.setItem(TOKEN_KEY, token);
    if (res.tokens?.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, res.tokens.refreshToken);
    }
    if (res.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
  }
  return res as AuthResponse;
}

/**
 * Obtém o usuário autenticado via GET /auth/me.
 * Valida o token e atualiza o usuário em memória/localStorage.
 */
export async function getMe(): Promise<UserSession> {
  const res = await apiGet<MeApiResponse>('/auth/me');
  const user: UserSession = {
    id: res.id,
    name: res.name,
    email: res.email,
    role: res.role as UserSession['role'],
    tenantId: res.tenantId,
    establishmentId: res.establishmentId ?? null,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  return user;
}

export async function refreshToken(): Promise<string> {
  const refresh = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  if (!refresh) throw new Error('No refresh token');
  const res = await apiPost<{ accessToken: string }>('/auth/refresh', { refreshToken: refresh });
  const token = (res as { accessToken?: string }).accessToken ?? (res as AuthResponse).tokens?.accessToken;
  if (token && typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function getStoredUser(): UserSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
