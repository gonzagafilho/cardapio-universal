import { API_BASE_URL } from '@/lib/constants';

export interface OnboardingPayload {
  companyName: string;
  companySlug: string;
  ownerName: string;
  email: string;
  password: string;
  storeName: string;
  storeSlug?: string;
  phone?: string;
  storeDescription?: string;
  /** Plano escolhido no cadastro (basic, pro, enterprise). Enviado para o backend persistir. */
  plan?: string;
}

export interface OnboardingResponse {
  ok: true;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    establishmentId?: string | null;
  };
  accessToken: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  publicCardUrl?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  errors?: Record<string, unknown>;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err: ApiError = {
      message:
        (data as { message?: string | string[] }).message instanceof Array
          ? (data as { message: string[] }).message.join(' ')
          : ((data as { message?: string }).message ?? 'Erro na requisição'),
      statusCode: res.status,
      code: (data as { code?: string }).code,
      errors: (data as { errors?: Record<string, unknown> }).errors,
    };
    throw err;
  }

  return (data as { data?: T }).data ?? (data as T);
}

export async function registerOnboarding(
  payload: OnboardingPayload,
): Promise<OnboardingResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<OnboardingResponse>(res);
}