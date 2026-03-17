import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private async invalidateStoreCategoryCache(establishmentId: string): Promise<void> {
    await Promise.all([
      this.cache.del(`store:${establishmentId}:categories`),
      this.cache.del(`store:${establishmentId}:products`),
    ]);
  }

  async create(tenantId: string, establishmentId: string, dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        tenantId,
        establishmentId,
        name: dto.name,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
    await this.invalidateStoreCategoryCache(establishmentId);
    return category;
  }

  async findAll(tenantId: string, establishmentId?: string) {
    return this.prisma.category.findMany({
      where: { tenantId, ...(establishmentId && { establishmentId }) },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
      include: { products: true },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return category;
  }

  async update(tenantId: string, id: string, dto: UpdateCategoryDto) {
    const existing = await this.findOne(tenantId, id);
    const updated = await this.prisma.category.update({
      where: { id },
      data: dto,
    });
    await this.invalidateStoreCategoryCache(existing.establishmentId);
    return updated;
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.findOne(tenantId, id);
    await this.prisma.category.delete({ where: { id } });
    await this.invalidateStoreCategoryCache(existing.establishmentId);
    return { message: 'Categoria removida' };
  }

  async reorder(tenantId: string, establishmentId: string, dto: ReorderCategoriesDto) {
    await Promise.all(
      dto.items.map((item) =>
        this.prisma.category.updateMany({
          where: { id: item.id, tenantId, establishmentId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    await this.invalidateStoreCategoryCache(establishmentId);
    return this.findAll(tenantId, establishmentId);
  }
}
