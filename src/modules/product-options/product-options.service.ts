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
    return this.prisma.productOptionGroup.findMany({
      where: { productId, tenantId },
      include: { items: true },
      orderBy: { sortOrder: 'asc' },
    });
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
    return this.prisma.productOptionGroup.create({
      data: {
        tenantId,
        productId,
        name: dto.name,
        minSelect: dto.minSelect ?? 0,
        maxSelect: dto.maxSelect ?? 1,
        isRequired: dto.isRequired ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { items: true },
    });
  }

  async updateGroup(
    tenantId: string,
    groupId: string,
    dto: UpdateOptionGroupDto,
  ) {
    const group = await this.prisma.productOptionGroup.findFirst({
      where: { id: groupId, tenantId },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    return this.prisma.productOptionGroup.update({
      where: { id: groupId },
      data: dto,
      include: { items: true },
    });
  }

  async removeGroup(tenantId: string, groupId: string) {
    const group = await this.prisma.productOptionGroup.findFirst({
      where: { id: groupId, tenantId },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    await this.prisma.productOptionGroup.delete({ where: { id: groupId } });
    return { message: 'Grupo removido' };
  }

  async createItem(
    tenantId: string,
    groupId: string,
    dto: CreateOptionItemDto,
  ) {
    const group = await this.prisma.productOptionGroup.findFirst({
      where: { id: groupId, tenantId },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    return this.prisma.productOptionItem.create({
      data: {
        tenantId,
        groupId,
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
    const item = await this.prisma.productOptionItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    const data: Record<string, unknown> = { ...dto };
    if (dto.price != null) data.price = new Decimal(dto.price);
    return this.prisma.productOptionItem.update({
      where: { id: itemId },
      data: data as never,
    });
  }

  async removeItem(tenantId: string, itemId: string) {
    const item = await this.prisma.productOptionItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    await this.prisma.productOptionItem.delete({ where: { id: itemId } });
    return { message: 'Item removido' };
  }
}
