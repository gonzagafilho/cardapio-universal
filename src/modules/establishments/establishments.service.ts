import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ROLES } from '../../common/constants/roles';

@Injectable()
export class EstablishmentsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const slug = (dto.slug ?? dto.name).toLowerCase().replace(/\s+/g, '-');
    const existing = await this.prisma.establishment.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    });
    if (existing) throw new ConflictException('Slug já em uso neste tenant');
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
    await this.findOne(tenantId, id, user);
    const slug = dto.slug
      ? dto.slug.toLowerCase().replace(/\s+/g, '-')
      : undefined;
    if (slug) {
      const existing = await this.prisma.establishment.findFirst({
        where: { tenantId, slug, id: { not: id } },
      });
      if (existing) throw new ConflictException('Slug já em uso');
    }
    return this.prisma.establishment.update({
      where: { id },
      data: { ...dto, ...(slug && { slug }) },
    });
  }

  async remove(tenantId: string, id: string, user: JwtPayload) {
    await this.findOne(tenantId, id, user);
    await this.prisma.establishment.delete({ where: { id } });
    return { message: 'Estabelecimento removido' };
  }
}
