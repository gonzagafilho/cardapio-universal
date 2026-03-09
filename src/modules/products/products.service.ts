import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ReorderProductsDto } from './dto/reorder-products.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    establishmentId: string,
    dto: CreateProductDto,
  ) {
    return this.prisma.product.create({
      data: {
        tenantId,
        establishmentId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        price: new Decimal(dto.price),
        promotionalPrice: dto.promotionalPrice != null ? new Decimal(dto.promotionalPrice) : undefined,
        sku: dto.sku,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { category: true },
    });
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
      include: { category: true, optionGroups: { include: { items: true } } },
    });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        optionGroups: { include: { items: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.price != null) data.price = new Decimal(dto.price);
    if (dto.promotionalPrice != null) data.promotionalPrice = new Decimal(dto.promotionalPrice);
    return this.prisma.product.update({
      where: { id },
      data: data as never,
      include: { category: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Produto removido' };
  }

  async updateStatus(tenantId: string, id: string, isActive: boolean) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive },
    });
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
    return this.findAll(tenantId, establishmentId);
  }
}
