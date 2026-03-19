import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_STATUS } from '../../common/constants/order-status';
import { Decimal } from '@prisma/client/runtime/library';
import { OrdersGateway, ORDER_EVENTS } from './orders.gateway';
import { TableSessionService } from '../table-session/table-session.service';

const MAX_ORDER_CREATE_RETRIES = 3;

const ORDER_TYPE_MAP: Record<string, OrderType> = {
  delivery: OrderType.DELIVERY,
  pickup: OrderType.PICKUP,
  dine_in: OrderType.DINE_IN,
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersGateway: OrdersGateway,
    private readonly tableSessionService: TableSessionService,
  ) {}

  private async generateOrderCode(tenantId: string, establishmentId: string, tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx ?? this.prisma;
    const count = await client.order.count({
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
    if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('Carrinho vazio');
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

    let resolvedTableId = dto.tableId;
    if (!resolvedTableId && dto.tableToken) {
      const tableByToken = await this.prisma.table.findFirst({
        where: {
          token: dto.tableToken.trim(),
          tenantId,
          establishmentId: dto.establishmentId,
          isActive: true,
        },
        select: { id: true },
      });
      if (!tableByToken) {
        throw new BadRequestException('Token de mesa/comanda inválido ou inativo');
      }
      resolvedTableId = tableByToken.id;
    }

    if (resolvedTableId) {
      const table = await this.prisma.table.findFirst({
        where: {
          id: resolvedTableId,
          tenantId,
          establishmentId: dto.establishmentId,
          isActive: true,
        },
      });
      if (!table) {
        throw new BadRequestException('Mesa/comanda inválida ou inativa');
      }
    }

    const subtotalAmount = Number(cart.subtotal);
    const discountAmount = Number(cart.discount);
    const deliveryFee = Number(cart.deliveryFee);
    const totalAmount = Number(cart.total);
    const paymentMethod = dto.paymentMethod != null ? (dto.paymentMethod.toUpperCase().replace('-', '_') as PaymentMethod) : null;

    let order: { id: string };
    for (let attempt = 1; attempt <= MAX_ORDER_CREATE_RETRIES; attempt++) {
      try {
        order = await this.prisma.$transaction(async (tx) => {
          const updated = await tx.cart.updateMany({
            where: {
              id: dto.cartId,
              tenantId,
              establishmentId: dto.establishmentId,
              status: 'open',
            },
            data: { status: 'converted' },
          });
          if (updated.count === 0) {
            throw new BadRequestException('Carrinho inválido ou já convertido');
          }

          let tableSessionId: string | undefined;
          if (resolvedTableId) {
            const session = await this.tableSessionService.findOpenOrCreate(
              tenantId,
              dto.establishmentId,
              resolvedTableId,
              tx,
            );
            tableSessionId = session.id;
          }

          const orderNumber = await this.generateOrderCode(tenantId, dto.establishmentId, tx);
          const created = await tx.order.create({
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
              tableId: resolvedTableId ?? undefined,
              tableSessionId,
            },
          });

          await tx.orderItem.createMany({
            data: cart.items.map((item) => ({
              tenantId,
              orderId: created.id,
              productId: item.productId,
              productNameSnapshot: item.product.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              notes: item.notes ?? undefined,
            })),
          });

          return created;
        });
      } catch (err) {
        if (attempt < MAX_ORDER_CREATE_RETRIES && err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          continue;
        }
        if (err instanceof BadRequestException) throw err;
        throw err;
      }

      this.ordersGateway.emitToEstablishment(dto.establishmentId, ORDER_EVENTS.CREATED, {
        orderId: order.id,
        establishmentId: dto.establishmentId,
      });
      return this.findOne(tenantId, order.id);
    }

    throw new BadRequestException('Não foi possível criar o pedido. Tente novamente.');
  }

  async findAll(
    tenantId: string,
    establishmentId?: string,
    page = 1,
    limit = 50,
  ) {
    const skip = Math.max(0, (page - 1) * limit);
    const take = Math.min(100, Math.max(1, limit));
    const orders = await this.prisma.order.findMany({
      where: { tenantId, ...(establishmentId && { establishmentId }) },
      include: { items: true, table: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    return orders.map((o) => this.toOrderResponse(o));
  }

  private toOrderResponse(order: { orderNumber: string; [k: string]: unknown }) {
    return { ...order, code: order.orderNumber };
  }

  async findOne(
    tenantId: string,
    id: string,
    scope?: { establishmentId?: string | null; role: string },
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } }, customer: true, table: true },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (
      scope?.establishmentId != null &&
      scope.role !== 'SUPER_ADMIN' &&
      scope.role !== 'TENANT_OWNER' &&
      (order as { establishmentId?: string }).establishmentId !== scope.establishmentId
    ) {
      throw new ForbiddenException('Acesso negado a este pedido');
    }
    return this.toOrderResponse(order);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS],
    scope?: { establishmentId?: string | null; role: string },
  ) {
    const order = await this.findOne(tenantId, id, scope);
    const establishmentId = (order as { establishmentId?: string }).establishmentId;
    const allowed: (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS][] = [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED];
    if (!(allowed as string[]).includes(status)) {
      throw new BadRequestException('Status inválido');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    if (establishmentId) {
      this.ordersGateway.emitToEstablishment(establishmentId, ORDER_EVENTS.STATUS_CHANGED, {
        orderId: id,
        establishmentId,
        status,
      });
    }
    return updated;
  }

  async cancel(tenantId: string, id: string, scope?: { establishmentId?: string | null; role: string }) {
    return this.updateStatus(tenantId, id, ORDER_STATUS.CANCELLED, scope);
  }

  async confirm(tenantId: string, id: string, scope?: { establishmentId?: string | null; role: string }) {
    return this.updateStatus(tenantId, id, ORDER_STATUS.CONFIRMED, scope);
  }

  async ready(tenantId: string, id: string, scope?: { establishmentId?: string | null; role: string }) {
    return this.updateStatus(tenantId, id, ORDER_STATUS.READY, scope);
  }

  async outForDelivery(tenantId: string, id: string, scope?: { establishmentId?: string | null; role: string }) {
    return this.updateStatus(tenantId, id, ORDER_STATUS.OUT_FOR_DELIVERY, scope);
  }

  async delivered(tenantId: string, id: string, scope?: { establishmentId?: string | null; role: string }) {
    return this.updateStatus(tenantId, id, ORDER_STATUS.COMPLETED, scope);
  }
}
