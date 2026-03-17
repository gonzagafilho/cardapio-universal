import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { PlansService } from '../plans/plans.service';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ROLES } from '../../common/constants/roles';

@Injectable()
export class EstablishmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly plansService: PlansService,
  ) {}

  private canAccessEstablishment(
    user: JwtPayload,
    tenantId: string,
    establishmentId?: string,
  ): boolean {
    if (user.role === ROLES.SUPER_ADMIN) return true;
    if (user.tenantId !== tenantId) return false;
    if (user.establishmentId && establishmentId && user.establishmentId !== establishmentId) {
      return false;
    }
    return true;
  }

  async create(tenantId: string, dto: CreateEstablishmentDto) {
    await this.plansService.checkEstablishmentsLimit(tenantId);
    const slug = (dto.slug ?? dto.name).toLowerCase().replace(/\s+/g, '-');
    const existing = await this.prisma.establishment.findUnique({
      where: { slug },
    });
    if (existing) throw new ConflictException('Slug já em uso (deve ser único no sistema)');
    return this.prisma.establishment.create({
      data: {
        tenantId,
        name: dto.name,
        slug,
        logoUrl: dto.logoUrl,
        bannerUrl: dto.bannerUrl,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        email: dto.email,
        description: dto.description,
        addressLine: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(tenantId: string, user: JwtPayload) {
    if (!this.canAccessEstablishment(user, tenantId)) {
      throw new ForbiddenException('Acesso negado');
    }
    const where: { tenantId: string; id?: string } = { tenantId };
    if (user.establishmentId && user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.TENANT_OWNER) {
      where.id = user.establishmentId;
    }
    return this.prisma.establishment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string, user: JwtPayload) {
    if (!this.canAccessEstablishment(user, tenantId, id)) {
      throw new ForbiddenException('Acesso negado');
    }
    const establishment = await this.prisma.establishment.findFirst({
      where: { id, tenantId },
    });
    if (!establishment) throw new NotFoundException('Estabelecimento não encontrado');
    return establishment;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateEstablishmentDto,
    user: JwtPayload,
  ) {
    const current = await this.findOne(tenantId, id, user);
    const slug = dto.slug
      ? dto.slug.toLowerCase().replace(/\s+/g, '-')
      : undefined;
    if (slug) {
      const existing = await this.prisma.establishment.findUnique({
        where: { slug },
      });
      if (existing && existing.id !== id) throw new ConflictException('Slug já em uso (deve ser único no sistema)');
    }
    const customDomain =
      dto.customDomain !== undefined
        ? (dto.customDomain?.trim() || null)
          ? dto.customDomain.split(':')[0].toLowerCase().trim()
          : null
        : undefined;
    if (customDomain !== undefined && customDomain) {
      const existing = await this.prisma.establishment.findFirst({
        where: { customDomain, id: { not: id } },
      });
      if (existing) throw new ConflictException('Este domínio já está em uso por outro estabelecimento');
    }
    try {
      const updated = await this.prisma.establishment.update({
        where: { id },
        data: {
          ...dto,
          ...(slug && { slug }),
          ...(customDomain !== undefined && { customDomain }),
        },
      });
      await Promise.all([
        current.slug ? this.cache.del(`store:slug:${current.slug}`) : Promise.resolve(),
        current.customDomain ? this.cache.del(`store:host:${current.customDomain.split(':')[0].toLowerCase()}`) : Promise.resolve(),
        updated.slug ? this.cache.del(`store:slug:${updated.slug}`) : Promise.resolve(),
        updated.customDomain ? this.cache.del(`store:host:${updated.customDomain.split(':')[0].toLowerCase()}`) : Promise.resolve(),
      ]);
      return updated;
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
        throw new ConflictException('Este domínio já está em uso');
      }
      throw e;
    }
  }

  async remove(tenantId: string, id: string, user: JwtPayload) {
    await this.findOne(tenantId, id, user);
    await this.prisma.establishment.delete({ where: { id } });
    return { message: 'Estabelecimento removido' };
  }
}
