import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StorePublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoreBySlug(slug: string) {
    const establishment = await this.prisma.establishment.findFirst({
      where: { slug, isActive: true },
      include: { tenant: { select: { name: true } } },
    });
    if (!establishment) throw new NotFoundException('Loja não encontrada');
    return establishment;
  }

  async getCategories(tenantId: string, establishmentId: string) {
    return this.prisma.category.findMany({
      where: { tenantId, establishmentId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        sortOrder: true,
      },
    });
  }

  async getProducts(tenantId: string, establishmentId: string, categoryId?: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        establishmentId,
        isActive: true,
        ...(categoryId && { categoryId }),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        category: { select: { id: true, name: true } },
        optionalGroups: {
          include: {
            optionalGroup: {
              include: { items: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
      },
    });
  }

  async getProduct(tenantId: string, establishmentId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        tenantId,
        establishmentId,
        isActive: true,
      },
      include: {
        category: true,
        optionalGroups: {
          include: {
            optionalGroup: {
              include: { items: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async getSettings(tenantId: string, establishmentId: string) {
    const settings = await this.prisma.storeSettings.findUnique({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
    });
    return settings ?? {};
  }
}
