import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ReorderProductsDto } from './dto/reorder-products.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private async invalidateStoreProductCache(establishmentId: string, categoryId?: string, productId?: string): Promise<void> {
    await Promise.all([
      this.cache.del(`store:${establishmentId}:products`),
      categoryId ? this.cache.del(`store:${establishmentId}:products:${categoryId}`) : Promise.resolve(),
      productId ? this.cache.del(`store:${establishmentId}:product:${productId}`) : Promise.resolve(),
    ]);
  }

  async create(
    tenantId: string,
    establishmentId: string,
    dto: CreateProductDto,
  ) {
    const slug = (dto as { slug?: string }).slug ?? dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const product = await this.prisma.product.create({
      data: {
        tenantId,
        establishmentId,
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        price: new Decimal(dto.price),
        compareAtPrice: dto.promotionalPrice != null ? new Decimal(dto.promotionalPrice) : undefined,
        sku: dto.sku,
        isActive: dto.isActive ?? true,
        isAvailable: dto.isAvailable ?? true,
        isFeatured: dto.isFeatured ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { category: true },
    });
    await this.invalidateStoreProductCache(establishmentId, dto.categoryId, product.id);
    return product;
  }

  async findAll(
    tenantId: string,
    establishmentId?: string,
    categoryId?: string,
  ) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        ...(establishmentId && { establishmentId }),
        ...(categoryId && { categoryId }),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: { category: true, optionalGroups: { include: { optionalGroup: { include: { items: true } } } } },
    });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        optionalGroups: { include: { optionalGroup: { include: { items: true } } } },
      },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(tenantId, id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.price != null) data.price = new Decimal(dto.price);
    if (dto.promotionalPrice != null) data.compareAtPrice = new Decimal(dto.promotionalPrice);
    const updated = await this.prisma.product.update({
      where: { id },
      data: data as never,
      include: { category: true },
    });
    await this.invalidateStoreProductCache(existing.establishmentId, existing.categoryId, id);
    return updated;
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.findOne(tenantId, id);
    await this.prisma.product.delete({ where: { id } });
    await this.invalidateStoreProductCache(existing.establishmentId, existing.categoryId, id);
    return { message: 'Produto removido' };
  }

  async updateStatus(tenantId: string, id: string, isActive: boolean) {
    const existing = await this.findOne(tenantId, id);
    const updated = await this.prisma.product.update({
      where: { id },
      data: { isActive },
    });
    await this.invalidateStoreProductCache(existing.establishmentId, existing.categoryId, id);
    return updated;
  }

  async reorder(
    tenantId: string,
    establishmentId: string,
    dto: ReorderProductsDto,
  ) {
    await Promise.all(
      dto.items.map((item) =>
        this.prisma.product.updateMany({
          where: { id: item.id, tenantId, establishmentId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    await this.invalidateStoreProductCache(establishmentId);
    return this.findAll(tenantId, establishmentId);
  }
}
