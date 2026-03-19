import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES } from '../constants/roles';
import { JwtPayload } from '../decorators/current-user.decorator';
import { SKIP_TRIAL_CHECK_KEY } from '../decorators/skip-trial-check.decorator';
import { env } from '../../config/env/env';

/**
 * Guard que bloqueia acesso quando o tenant está em trial e trialEndsAt já passou.
 * Não bloqueia: rotas @Public(), SUPER_ADMIN, sem tenantId, sem Subscription,
 * GET /auth/me, GET /billing/subscription (via @SkipTrialCheck), status active/cancelled/past_due.
 */
@Injectable()
export class TrialGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user) return true;
    if (user.role === ROLES.SUPER_ADMIN) return true;
    if (!user.tenantId) return true;

    if (env.isOnPrem) {
      if (env.onPremLicenseValid) return true;
      throw new ForbiddenException({
        message: 'Licença local inválida ou expirada',
        code: 'ONPREM_LICENSE_INVALID',
      });
    }

    const skipTrialCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRIAL_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipTrialCheck) return true;

    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId: user.tenantId },
      select: { status: true, trialEndsAt: true },
    });
    if (!sub) return true;
    if (sub.status !== SubscriptionStatus.trialing) return true;
    if (sub.trialEndsAt == null) return true;
    if (sub.trialEndsAt >= new Date()) return true;

    throw new ForbiddenException({
      message: 'Período de teste expirado',
      code: 'TRIAL_EXPIRED',
    });
  }
}
