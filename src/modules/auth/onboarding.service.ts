import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService, AuthResponse } from './auth.service';
import { OnboardingDto } from './dto/onboarding.dto';

/** Duração do trial para novos tenants (dias). */
const DEFAULT_TRIAL_DAYS = 7;

/** Slug válido: apenas letras minúsculas, números e hífens; mínimo 2 caracteres. */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Categorias padrão criadas no primeiro estabelecimento. */
const DEFAULT_CATEGORIES = [
  { name: 'Mais pedidos', sortOrder: 0 },
  { name: 'Combos', sortOrder: 1 },
  { name: 'Lanches', sortOrder: 2 },
  { name: 'Bebidas', sortOrder: 3 },
  { name: 'Sobremesas', sortOrder: 4 },
];

function normalizeSlug(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: OnboardingDto): Promise<AuthResponse> {
    const tenantSlug = normalizeSlug(dto.companySlug);
    const storeSlug = normalizeSlug(dto.storeSlug ?? dto.storeName);

    if (!SLUG_REGEX.test(tenantSlug) || tenantSlug.length < 2) {
      throw new BadRequestException(
        'Slug da empresa inválido. Use apenas letras, números e hífens (mín. 2 caracteres).',
      );
    }
    if (!SLUG_REGEX.test(storeSlug) || storeSlug.length < 2) {
      throw new BadRequestException(
        'Slug do estabelecimento inválido. Use apenas letras, números e hífens (mín. 2 caracteres).',
      );
    }

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });
    if (existingTenant) {
      throw new ConflictException('Este slug de empresa já está em uso');
    }

    await this.prisma.$transaction(async (tx) => {
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
      await tx.user.create({
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

      for (const cat of DEFAULT_CATEGORIES) {
        await tx.category.create({
          data: {
            tenantId: tenant.id,
            establishmentId: establishment.id,
            name: cat.name,
            sortOrder: cat.sortOrder,
            isActive: true,
          },
        });
      }
    });

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });
    if (!tenant) {
      throw new ConflictException('Falha ao concluir cadastro. Tente fazer login.');
    }

    const authResponse = await this.authService.login(
      { email: dto.email.trim().toLowerCase(), password: dto.password },
      tenant.id,
    );

    const baseUrl = this.config.get<string>('APP_PUBLIC_URL') ?? '';
    const publicCardUrl = baseUrl
      ? `${baseUrl.replace(/\/$/, '')}/${storeSlug}`
      : `/${storeSlug}`;

    return {
      ...authResponse,
      publicCardUrl,
    };
  }
}
