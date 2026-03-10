import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_STATUS } from '../../common/constants/order-status';
import { Decimal } from '@prisma/client/runtime/library';

const ORDER_TYPE_MAP: Record<string, OrderType> = {
  delivery: OrderType.DELIVERY,
  pickup: OrderType.PICKUP,
  dine_in: OrderType.DINE_IN,
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateOrderCode(tenantId: string, establishmentId: string): Promise<string> {
    const count = await this.prisma.order.count({
      where: { tenantId, establishmentId },
    });
    return String(count + 1).padStart(5, '0');
  }

  async create(tenantId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: dto.cartId, tenantId, establishmentId: dto.establishmentId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.status !== 'open') {
      throw new BadRequestException('Carrinho inválido ou já convertido');
    }

    // Produtos devem estar ativos e disponíveis (não esgotados)
    for (const item of cart.items) {
      if (!item.product) {
        throw new BadRequestException(`Produto do item não encontrado`);
      }
      if (!item.product.isActive) {
        throw new BadRequestException(`Produto "${item.product.name}" não está mais ativo`);
      }
      if (item.product.isAvailable === false) {
        throw new BadRequestException(`Produto "${item.product.name}" está temporariamente indisponível`);
      }
    }

    const orderType = ORDER_TYPE_MAP[dto.type] ?? OrderType.DELIVERY;

    // Pedido mínimo: só para delivery usa minimumOrderAmountDelivery (fallback em minimumOrderAmount)
    if (orderType === OrderType.DELIVERY) {
      const settings = await this.prisma.storeSettings.findUnique({
        where: { tenantId_establishmentId: { tenantId, establishmentId: dto.establishmentId } },
      });
      const minimum =
        settings?.minimumOrderAmountDelivery != null
          ? Number(settings.minimumOrderAmountDelivery)
          : settings?.minimumOrderAmount != null
            ? Number(settings.minimumOrderAmount)
            : null;
      if (minimum != null && Number(cart.subtotal) < minimum) {
        throw new BadRequestException(
          `Pedido mínimo para entrega: R$ ${minimum.toFixed(2).replace('.', ',')}`,
        );
      }
    }

    if (dto.tableId) {
      const table = await this.prisma.table.findFirst({
        where: {
          id: dto.tableId,
          tenantId,
          establishmentId: dto.establishmentId,
          isActive: true,
        },
      });
      if (!table) {
        throw new BadRequestException('Mesa/comanda inválida ou inativa');
      }
    }

    const orderNumber = await this.generateOrderCode(tenantId, dto.establishmentId);
    const subtotalAmount = Number(cart.subtotal);
    const discountAmount = Number(cart.discount);
    const deliveryFee = Number(cart.deliveryFee);
    const totalAmount = Number(cart.total);
    const paymentMethod = dto.paymentMethod != null ? (dto.paymentMethod.toUpperCase().replace('-', '_') as PaymentMethod) : null;

    const order = await this.prisma.order.create({
      data: {
        tenantId,
        establishmentId: dto.establishmentId,
        customerId: dto.customerId ?? cart.customerId,
        orderNumber,
        type: orderType,
        status: ORDER_STATUS.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod,
        subtotalAmount: new Decimal(subtotalAmount),
        discountAmount: new Decimal(discountAmount),
        deliveryFee: new Decimal(deliveryFee),
        totalAmount: new Decimal(totalAmount),
        notes: dto.notes,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        deliveryAddressSnapshot: dto.deliveryAddress,
        tableId: dto.tableId ?? undefined,
      },
    });

    for (const item of cart.items) {
      await this.prisma.orderItem.create({
        data: {
          tenantId,
          orderId: order.id,
          productId: item.productId,
          productNameSnapshot: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes ?? undefined,
        },
      });
    }

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'converted' },
    });

    return this.findOne(tenantId, order.id);
  }

  async findAll(tenantId: string, establishmentId?: string) {
    const orders = await this.prisma.order.findMany({
      where: { tenantId, ...(establishmentId && { establishmentId }) },
      include: { items: true, table: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.toOrderResponse(o));
  }

  private toOrderResponse(order: { orderNumber: string; [k: string]: unknown }) {
    return { ...order, code: order.orderNumber };
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } }, customer: true, table: true },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return this.toOrderResponse(order);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS],
  ) {
    const order = await this.findOne(tenantId, id);
    const allowed: (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS][] = [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED];
    if (!(allowed as string[]).includes(status)) {
      throw new BadRequestException('Status inválido');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }

  async cancel(tenantId: string, id: string) {
    return this.updateStatus(tenantId, id, ORDER_STATUS.CANCELLED);
  }

  async confirm(tenantId: string, id: string) {
    return this.updateStatus(tenantId, id, ORDER_STATUS.CONFIRMED);
  }

  async ready(tenantId: string, id: string) {
    return this.updateStatus(tenantId, id, ORDER_STATUS.READY);
  }

  async outForDelivery(tenantId: string, id: string) {
    return this.updateStatus(tenantId, id, ORDER_STATUS.OUT_FOR_DELIVERY);
  }

  async delivered(tenantId: string, id: string) {
    return this.updateStatus(tenantId, id, ORDER_STATUS.COMPLETED);
  }
}
