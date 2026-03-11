import { SetMetadata } from '@nestjs/common';

export const SKIP_TRIAL_CHECK_KEY = 'skipTrialCheck';

/**
 * Marca a rota como isenta da checagem de trial expirado (TrialGuard).
 * Usado em GET /auth/me e GET /billing/subscription para permitir acesso
 * mesmo com trial expirado (ex.: ver assinatura e fazer upgrade).
 */
export const SkipTrialCheck = () => SetMetadata(SKIP_TRIAL_CHECK_KEY, true);
