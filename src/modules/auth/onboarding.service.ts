import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService, AuthResponse } from './auth.service';
import { OnboardingDto } from './dto/onboarding.dto';

/** Duração do trial para novos tenants (dias). */
const DEFAULT_TRIAL_DAYS = 7;

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async register(dto: OnboardingDto): Promise<AuthResponse> {
    const tenantSlug = dto.companySlug.toLowerCase().trim().replace(/\s+/g, '-');
    const storeSlug = (dto.storeSlug ?? dto.storeName)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });
    if (existingTenant) {
      throw new ConflictException('Este slug de empresa já está em uso');
    }

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName.trim(),
          slug: tenantSlug,
          plan: 'basic',
          status: 'active',
          isActive: true,
        },
      });

      const establishment = await tx.establishment.create({
        data: {
          tenantId: tenant.id,
          name: dto.storeName.trim(),
          slug: storeSlug,
          description: dto.storeDescription?.trim() ?? undefined,
          phone: dto.phone?.trim() ?? undefined,
          isActive: true,
        },
      });

      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          establishmentId: establishment.id,
          name: dto.ownerName.trim(),
          email: dto.email.trim().toLowerCase(),
          passwordHash,
          role: Role.TENANT_OWNER,
          isActive: true,
        },
      });

      await tx.storeSettings.create({
        data: {
          tenantId: tenant.id,
          establishmentId: establishment.id,
          acceptsDelivery: true,
          acceptsPickup: true,
          acceptsDineIn: true,
          currency: 'BRL',
        },
      });

      const trialStartsAt = new Date();
      const trialEndsAt = new Date(trialStartsAt);
      trialEndsAt.setDate(trialEndsAt.getDate() + DEFAULT_TRIAL_DAYS);
      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          plan: tenant.plan,
          status: SubscriptionStatus.trialing,
          trialStartsAt,
          trialEndsAt,
        },
      });

      return this.authService.login(
        { email: dto.email.trim().toLowerCase(), password: dto.password },
        tenant.id,
      );
    });
  }
}
