import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string | null, dto: CreateCartDto) {
    let resolvedTenantId = tenantId;
    if (!resolvedTenantId) {
      const establishment = await this.prisma.establishment.findUnique({
        where: { id: dto.establishmentId },
        select: { tenantId: true },
      });
      if (!establishment) throw new NotFoundException('Estabelecimento não encontrado');
      resolvedTenantId = establishment.tenantId;
    }
    const sessionId = dto.sessionId ?? randomUUID();
    return this.prisma.cart.create({
      data: {
        tenantId: resolvedTenantId,
        establishmentId: dto.establishmentId,
        customerId: dto.customerId,
        sessionId,
        status: 'open',
        subtotal: new Decimal(0),
        discount: new Decimal(0),
        deliveryFee: new Decimal(0),
        total: new Decimal(0),
      },
      include: { items: true },
    });
  }

  async findOne(tenantId: string, id: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { id, tenantId },
      include: {
        items: { include: { product: true } },
        establishment: true,
      },
    });
    if (!cart) throw new NotFoundException('Carrinho não encontrado');
    return cart;
  }

  async addItem(
    tenantId: string,
    cartId: string,
    dto: AddCartItemDto,
  ) {
    const cart = await this.findOne(tenantId, cartId);
    if (cart.status !== 'open') {
      throw new NotFoundException('Carrinho não está aberto');
    }
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId, isActive: true },
      include: { optionGroups: { include: { items: true } } },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    const unitPrice = Number(product.promotionalPrice ?? product.price);
    const totalPrice = new Decimal(unitPrice * dto.quantity);
    await this.prisma.cartItem.create({
      data: {
        cartId,
        productId: product.id,
        quantity: dto.quantity,
        unitPrice: new Decimal(unitPrice),
        notes: dto.notes,
        totalPrice,
      },
    });
    return this.calculateCart(tenantId, cartId);
  }

  async updateItem(
    tenantId: string,
    cartId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.findOne(tenantId, cartId);
    if (cart.status !== 'open') throw new NotFoundException('Carrinho não está aberto');
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    const quantity = dto.quantity ?? item.quantity;
    const unitPrice = item.unitPrice;
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        ...(dto.quantity != null && { quantity }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        totalPrice: new Decimal(Number(unitPrice) * quantity),
      },
    });
    return this.calculateCart(tenantId, cartId);
  }

  async removeItem(tenantId: string, cartId: string, itemId: string) {
    const cart = await this.findOne(tenantId, cartId);
    if (cart.status !== 'open') throw new NotFoundException('Carrinho não está aberto');
    await this.prisma.cartItem.deleteMany({
      where: { id: itemId, cartId },
    });
    return this.calculateCart(tenantId, cartId);
  }

  async applyCoupon(tenantId: string, cartId: string, code: string) {
    const cart = await this.findOne(tenantId, cartId);
    if (cart.status !== 'open') throw new NotFoundException('Carrinho não está aberto');
    // TODO: validar cupom e aplicar desconto
    return this.calculateCart(tenantId, cartId);
  }

  async removeCoupon(tenantId: string, cartId: string) {
    const cart = await this.findOne(tenantId, cartId);
    if (cart.status !== 'open') throw new NotFoundException('Carrinho não está aberto');
    // TODO: remover cupom do carrinho
    return this.calculateCart(tenantId, cartId);
  }

  async calculateCart(tenantId: string, cartId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, tenantId },
      include: { items: true },
    });
    if (!cart) throw new NotFoundException('Carrinho não encontrado');
    const subtotal = cart.items.reduce(
      (sum, i) => sum + Number(i.totalPrice),
      0,
    );
    const discount = Number(cart.discount);
    const deliveryFee = Number(cart.deliveryFee);
    const total = Math.max(0, subtotal - discount + deliveryFee);
    await this.prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal: new Decimal(subtotal),
        total: new Decimal(total),
      },
    });
    return this.findOne(tenantId, cartId);
  }
}
