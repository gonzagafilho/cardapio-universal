import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOptionGroupDto } from './dto/create-option-group.dto';
import { UpdateOptionGroupDto } from './dto/update-option-group.dto';
import { CreateOptionItemDto } from './dto/create-option-item.dto';
import { UpdateOptionItemDto } from './dto/update-option-item.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductOptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findGroupsByProduct(tenantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    const links = await this.prisma.productOptionalGroup.findMany({
      where: { productId },
      include: {
        optionalGroup: { include: { items: { orderBy: { sortOrder: 'asc' } } } },
      },
    });
    return links
      .map((l) => l.optionalGroup)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createGroup(
    tenantId: string,
    productId: string,
    dto: CreateOptionGroupDto,
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    const optionalGroup = await this.prisma.optionalGroup.create({
      data: {
        tenantId,
        establishmentId: product.establishmentId,
        name: dto.name,
        minSelect: dto.minSelect ?? 0,
        maxSelect: dto.maxSelect ?? 1,
        isRequired: dto.isRequired ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { items: true },
    });
    await this.prisma.productOptionalGroup.create({
      data: { productId, optionalGroupId: optionalGroup.id },
    });
    return optionalGroup;
  }

  async updateGroup(
    tenantId: string,
    groupId: string,
    dto: UpdateOptionGroupDto,
  ) {
    const group = await this.prisma.optionalGroup.findFirst({
      where: { id: groupId, tenantId },
      include: { items: true },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    return this.prisma.optionalGroup.update({
      where: { id: groupId },
      data: {
        ...(dto.name != null && { name: dto.name }),
        ...(dto.minSelect != null && { minSelect: dto.minSelect }),
        ...(dto.maxSelect != null && { maxSelect: dto.maxSelect }),
        ...(dto.isRequired != null && { isRequired: dto.isRequired }),
        ...(dto.sortOrder != null && { sortOrder: dto.sortOrder }),
      },
      include: { items: true },
    });
  }

  async removeGroup(tenantId: string, groupId: string) {
    const group = await this.prisma.optionalGroup.findFirst({
      where: { id: groupId, tenantId },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    await this.prisma.productOptionalGroup.deleteMany({
      where: { optionalGroupId: groupId },
    });
    await this.prisma.optionalGroup.delete({ where: { id: groupId } });
    return { message: 'Grupo removido' };
  }

  async createItem(
    tenantId: string,
    groupId: string,
    dto: CreateOptionItemDto,
  ) {
    const group = await this.prisma.optionalGroup.findFirst({
      where: { id: groupId, tenantId },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    return this.prisma.optionalItem.create({
      data: {
        tenantId,
        optionalGroupId: groupId,
        name: dto.name,
        price: new Decimal(dto.price ?? 0),
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateItem(
    tenantId: string,
    itemId: string,
    dto: UpdateOptionItemDto,
  ) {
    const item = await this.prisma.optionalItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    const data: Record<string, unknown> = { ...dto };
    if (dto.price != null) data.price = new Decimal(dto.price);
    return this.prisma.optionalItem.update({
      where: { id: itemId },
      data: data as never,
    });
  }

  async removeItem(tenantId: string, itemId: string) {
    const item = await this.prisma.optionalItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    await this.prisma.optionalItem.delete({ where: { id: itemId } });
    return { message: 'Item removido' };
  }
}
