export type Role =
  | 'SUPER_ADMIN'
  | 'TENANT_OWNER'
  | 'TENANT_ADMIN'
  | 'TENANT_STAFF'
  | 'MANAGER'
  | 'ATTENDANT'
  | 'OPERATOR';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
  establishmentId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Resposta do backend POST /auth/login e POST /auth/onboarding (pode incluir ok e accessToken no root). Onboarding retorna ainda publicCardUrl. */
export interface AuthResponse {
  user: UserSession;
  tokens: AuthTokens;
  ok?: boolean;
  accessToken?: string;
  /** Link do cardápio público (retornado apenas no onboarding). */
  publicCardUrl?: string;
}
