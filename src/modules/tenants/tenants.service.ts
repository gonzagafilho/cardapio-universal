import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ROLES } from '../../common/constants/roles';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  private canAccessTenant(user: JwtPayload, tenantId: string): boolean {
    if (user.role === ROLES.SUPER_ADMIN) return true;
    return user.tenantId === tenantId;
  }

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Slug já em uso');
    }
    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug.toLowerCase(),
        plan: dto.plan ?? 'basic',
        status: dto.status ?? 'active',
      },
    });
  }

  async findAll(user: JwtPayload) {
    if (user.role === ROLES.SUPER_ADMIN) {
      return this.prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.tenant.findMany({
      where: { id: user.tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: JwtPayload, id: string) {
    if (!this.canAccessTenant(user, id)) {
      throw new ForbiddenException('Acesso negado a este tenant');
    }
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { _count: { select: { establishments: true, users: true } } },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return tenant;
  }

  async update(user: JwtPayload, id: string, dto: UpdateTenantDto) {
    if (!this.canAccessTenant(user, id)) {
      throw new ForbiddenException('Acesso negado a este tenant');
    }
    await this.findOne(user, id);
    if (dto.slug) {
      const existing = await this.prisma.tenant.findFirst({
        where: { slug: dto.slug.toLowerCase(), id: { not: id } },
      });
      if (existing) throw new ConflictException('Slug já em uso');
    }
    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.slug && { slug: dto.slug.toLowerCase() }),
      },
    });
  }

  async remove(user: JwtPayload, id: string) {
    if (user.role !== ROLES.SUPER_ADMIN) {
      throw new ForbiddenException('Apenas SUPER_ADMIN pode remover tenants');
    }
    await this.findOne(user, id);
    await this.prisma.tenant.delete({ where: { id } });
    return { message: 'Tenant removido' };
  }
}
