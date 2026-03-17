import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { Weekday } from '@prisma/client';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
import { CacheService } from '../cache/cache.service';
import { UpsertPublicCartItemDto } from './dto/upsert-public-cart-item.dto';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';

const CACHE_NULL = '__CACHE_NULL__';

type ProductRow = {
  price: Decimal;
  compareAtPrice?: Decimal | null;
  optionalGroups?: { optionalGroup: { id: string; name: string; minSelect: number; maxSelect: number; isRequired: boolean; sortOrder: number; items: Array<{ id: string; name: string; price: Decimal; isActive: boolean; sortOrder: number }> } }[];
  [k: string]: unknown;
};

/** Mapeia produto Prisma para formato do frontend (promotionalPrice, optionGroups, números). */
function mapProductToPublic(row: ProductRow) {
  const price = Number(row.price);
  const promotionalPrice = row.compareAtPrice != null ? Number(row.compareAtPrice) : null;
  const optionGroups = (row.optionalGroups ?? []).map((link) => {
    const g = link.optionalGroup;
    return {
      id: g.id,
      name: g.name,
      minSelect: g.minSelect,
      maxSelect: g.maxSelect,
      isRequired: g.isRequired,
      sortOrder: g.sortOrder,
      items: (g.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        isActive: item.isActive,
        sortOrder: item.sortOrder,
      })),
    };
  });
  const { optionalGroups: _o, compareAtPrice: _c, ...rest } = row;
  return { ...rest, price, promotionalPrice, optionGroups };
}

const WEEKDAY_KEYS: Record<Weekday, string> = {
  [Weekday.SUNDAY]: 'sun',
  [Weekday.MONDAY]: 'mon',
  [Weekday.TUESDAY]: 'tue',
  [Weekday.WEDNESDAY]: 'wed',
  [Weekday.THURSDAY]: 'thu',
  [Weekday.FRIDAY]: 'fri',
  [Weekday.SATURDAY]: 'sat',
};

/** Normaliza host para comparação (lowercase, sem porta). */
function normalizeHost(host: string): string {
  return host.split(':')[0].toLowerCase().trim();
}

/**
 * Extrai slug do subdomínio quando host é do tipo subdomain.baseDomain.
 * Ex.: empresa.cardapio.app + baseDomain cardapio.app → empresa.
 */
function extractSubdomainSlug(host: string, baseDomain: string): string | null {
  const base = baseDomain.toLowerCase().trim();
  if (!base || !host) return null;
  const h = normalizeHost(host);
  if (h === base) return null;
  const suffix = `.${base}`;
  if (!h.endsWith(suffix)) return null;
  const sub = h.slice(0, -suffix.length);
  return sub && !sub.includes('.') ? sub : null;
}

/**
 * API pública do cardápio (por host/slug). Candidato a cache por tenant/slug quando houver
 * Redis: getStoreByHost, getStoreBySlug, getCategories, getProducts, getSettings (chave ex.: store:${slug}, TTL curto).
 */
@Injectable()
export class StorePublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Helper central: resolve o estabelecimento por requestHost (domínio custom ou subdomínio) ou slug.
   * 1) Se requestHost corresponder a um customDomain → retorna esse estabelecimento.
   * 2) Se requestHost for subdomínio do domínio base (ex. empresa.cardapio.app) → busca por slug do subdomínio.
   * 3) Caso contrário → fallback para slug.
   */
  async resolveStore(requestHost?: string, slug?: string) {
    if (requestHost) {
      const byHost = await this.getStoreByHost(requestHost);
      if (byHost) return byHost;
    }
    if (slug) return this.getStoreBySlug(slug);
    throw new NotFoundException('Loja não encontrada');
  }

  /**
   * Resolve loja por host:
   * 1) Domínio personalizado (Establishment.customDomain = host).
   * 2) Subdomínio do domínio base (ex. empresa.cardapio.app → slug "empresa" → Establishment.slug).
   */
  async getStoreByHost(host: string) {
    const normalized = normalizeHost(host);
    if (!normalized) return null;

    const cacheKey = `store:host:${normalized}`;
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      if (cached === CACHE_NULL) return null;
      return JSON.parse(cached);
    }

    const byCustomDomain = await this.prisma.establishment.findFirst({
      where: { customDomain: normalized, isActive: true },
      include: { tenant: { select: { name: true, primaryColor: true, secondaryColor: true } } },
    });
    if (byCustomDomain) {
      await this.cache.set(cacheKey, JSON.stringify(byCustomDomain));
      return byCustomDomain;
    }

    const baseDomain = this.config.get<string>('SUBDOMAIN_BASE_DOMAIN') ?? '';
    const slug = extractSubdomainSlug(normalized, baseDomain);
    if (slug) {
      try {
        const store = await this.getStoreBySlug(slug);
        await this.cache.set(cacheKey, JSON.stringify(store));
        return store;
      } catch {
        await this.cache.set(cacheKey, CACHE_NULL);
        return null;
      }
    }
    await this.cache.set(cacheKey, CACHE_NULL);
    return null;
  }

	  async getStoreBySlug(slug: string) {
	    const cacheKey = `store:slug:${slug}`;
	    const cached = await this.cache.get(cacheKey);
	    if (cached !== null) {
	      return JSON.parse(cached);
	    }

	    const establishment = await this.prisma.establishment.findUnique({
	      where: { slug },
	      include: { tenant: { select: { name: true, primaryColor: true, secondaryColor: true } } },
	    });
	    if (!establishment || !establishment.isActive) throw new NotFoundException('Loja não encontrada');
	    await this.cache.set(cacheKey, JSON.stringify(establishment));
	    return establishment;
	  }

  async getCategories(tenantId: string, establishmentId: string) {
    const cacheKey = `store:${establishmentId}:categories`;
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return JSON.parse(cached);
    }

    const result = await this.prisma.category.findMany({
      where: { tenantId, establishmentId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        sortOrder: true,
      },
    });
    await this.cache.set(cacheKey, JSON.stringify(result));
    return result;
  }

  async getProducts(tenantId: string, establishmentId: string, categoryId?: string) {
    const cacheKey = categoryId
      ? `store:${establishmentId}:products:${categoryId}`
      : `store:${establishmentId}:products`;
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return JSON.parse(cached);
    }

    const rows = await this.prisma.product.findMany({
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
    const result = rows.map((row) => mapProductToPublic(row));
    await this.cache.set(cacheKey, JSON.stringify(result));
    return result;
  }

  async getProduct(tenantId: string, establishmentId: string, productId: string) {
    const cacheKey = `store:${establishmentId}:product:${productId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return JSON.parse(cached);
    }

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
    const result = mapProductToPublic(product);
    await this.cache.set(cacheKey, JSON.stringify(result));
    return result;
  }

     async getSettings(tenantId: string, establishmentId: string) {
    const cacheKey = `store:${establishmentId}:settings`;
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return JSON.parse(cached);
    }

    const [settings, tenant, hours] = await Promise.all([
      this.prisma.storeSettings.findUnique({
        where: { tenantId_establishmentId: { tenantId, establishmentId } },
      }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { primaryColor: true, secondaryColor: true },
      }),
      this.prisma.establishmentWorkingHours.findMany({
        where: { establishmentId },
        orderBy: { weekday: 'asc' },
      }),
    ]);

    const openHours: Record<string, { open: string; close: string } | null> = {};
    for (const h of hours ?? []) {
      const key = WEEKDAY_KEYS[h.weekday];
      openHours[key] =
        h.isClosed || h.openTime == null || h.closeTime == null
          ? null
          : { open: h.openTime, close: h.closeTime };
    }

    const result = {
      ...(settings ?? {}),
      primaryColor: tenant?.primaryColor ?? undefined,
      secondaryColor: tenant?.secondaryColor ?? undefined,
      openHours: Object.keys(openHours).length ? openHours : undefined,
      deliveryFee: settings?.deliveryFee != null ? Number(settings.deliveryFee) : undefined,
      minimumOrderAmount:
        settings?.minimumOrderAmount != null
          ? Number(settings.minimumOrderAmount)
          : undefined,
      minimumOrderAmountDelivery:
        settings?.minimumOrderAmountDelivery != null
          ? Number(settings.minimumOrderAmountDelivery)
          : undefined,
      estimatedDeliveryTimeMin:
        settings?.estimatedDeliveryTimeMin != null
          ? Number(settings.estimatedDeliveryTimeMin)
          : undefined,
      estimatedDeliveryTimeMax:
        settings?.estimatedDeliveryTimeMax != null
          ? Number(settings.estimatedDeliveryTimeMax)
          : undefined,
    };

    await this.cache.set(cacheKey, JSON.stringify(result));
    return result;
  }
    private async getOrCreateOpenCart(tenantId: string, establishmentId: string, sessionId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: {
        tenantId,
        establishmentId,
        sessionId,
        status: 'open',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          tenantId,
          establishmentId,
          sessionId,
          status: 'open',
          subtotal: new Decimal(0),
          discount: new Decimal(0),
          deliveryFee: new Decimal(0),
          total: new Decimal(0),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return cart;
  }

  private async recalculateCart(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
      select: {
        totalPrice: true,
      },
    });

    const subtotal = items.reduce((acc, item) => acc + Number(item.totalPrice), 0);
    const discount = 0;
    const deliveryFee = 0;
    const total = subtotal - discount + deliveryFee;

    await this.prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal: new Decimal(subtotal),
        discount: new Decimal(discount),
        deliveryFee: new Decimal(deliveryFee),
        total: new Decimal(total),
      },
    });
  }

  private mapPublicCart(cart: any) {
    return {
      ...cart,
      subtotal: Number(cart.subtotal ?? 0),
      discount: Number(cart.discount ?? 0),
      deliveryFee: Number(cart.deliveryFee ?? 0),
      total: Number(cart.total ?? 0),
      items: (cart.items ?? []).map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice ?? 0),
        totalPrice: Number(item.totalPrice ?? 0),
        product: item.product ? mapProductToPublic(item.product) : null,
      })),
    };
  }

  async upsertCartItem(slug: string, dto: UpsertPublicCartItemDto) {
    const store = await this.getStoreBySlug(slug);

    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        tenantId: store.tenantId,
        establishmentId: store.id,
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true } },
        optionalGroups: {
          include: {
            optionalGroup: {
              include: {
                items: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (product.isAvailable === false) {
      throw new BadRequestException('Produto temporariamente indisponível');
    }

    const cart = await this.getOrCreateOpenCart(store.tenantId, store.id, dto.sessionId);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
      },
    });

    const unitPrice = Number(product.price);
    const totalPrice = unitPrice * dto.quantity;

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: dto.quantity,
          unitPrice: new Decimal(unitPrice),
          totalPrice: new Decimal(totalPrice),
          notes: dto.notes ?? null,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: dto.quantity,
          unitPrice: new Decimal(unitPrice),
          totalPrice: new Decimal(totalPrice),
          notes: dto.notes ?? null,
        },
      });
    }

    await this.recalculateCart(cart.id);

    const updatedCart = await this.prisma.cart.findFirst({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true } },
                optionalGroups: {
                  include: {
                    optionalGroup: {
                      include: {
                        items: {
                          where: { isActive: true },
                          orderBy: { sortOrder: 'asc' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.mapPublicCart(updatedCart);
  }

  async getPublicCart(slug: string, sessionId: string) {
    const store = await this.getStoreBySlug(slug);

    const cart = await this.getOrCreateOpenCart(store.tenantId, store.id, sessionId);

    const fullCart = await this.prisma.cart.findFirst({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true } },
                optionalGroups: {
                  include: {
                    optionalGroup: {
                      include: {
                        items: {
                          where: { isActive: true },
                          orderBy: { sortOrder: 'asc' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.mapPublicCart(fullCart);
  }

  async removeCartItem(slug: string, sessionId: string, itemId: string) {
    const store = await this.getStoreBySlug(slug);

    const cart = await this.prisma.cart.findFirst({
      where: {
        tenantId: store.tenantId,
        establishmentId: store.id,
        sessionId,
        status: 'open',
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    await this.recalculateCart(cart.id);

    return this.getPublicCart(slug, sessionId);
  }

  async createPublicOrder(slug: string, dto: CreatePublicOrderDto) {
    const store = await this.getStoreBySlug(slug);

    const cart = await this.prisma.cart.findFirst({
      where: {
        id: dto.cartId,
        tenantId: store.tenantId,
        establishmentId: store.id,
        sessionId: dto.sessionId,
        status: 'open',
      },
    });

    if (!cart) {
      throw new BadRequestException('Carrinho inválido para esta loja/sessionId');
    }

    const order = await this.ordersService.create(store.tenantId, {
      establishmentId: store.id,
      cartId: dto.cartId,
      type: dto.type,
      paymentMethod: dto.paymentMethod,
      notes: dto.notes,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      deliveryAddress: dto.deliveryAddress,
      tableId: dto.tableId,
    });

    const paymentMethodNorm = (dto.paymentMethod ?? '').toLowerCase().replace(/-/g, '').replace(/_/g, '');
    if (paymentMethodNorm === 'pix') {
      try {
        const orderWithAmount = order as unknown as { id: string; totalAmount: unknown };
        const payment = await this.paymentsService.createPix(
          store.tenantId,
          store.id,
          orderWithAmount.id,
          Number(orderWithAmount.totalAmount),
          '',
        );
        return { order, payment };
      } catch (err) {
        const paymentError = err && typeof (err as Error).message === 'string' ? (err as Error).message : 'Erro ao gerar PIX';
        return { order, payment: null, paymentError };
      }
    }

    return { order, payment: null };
  }

  async getPublicOrder(slug: string, id: string) {
    const store = await this.getStoreBySlug(slug);

    const order = await this.ordersService.findOne(store.tenantId, id);

    if ((order as any).establishmentId !== store.id) {
      throw new NotFoundException('Pedido não encontrado');
    }

    const paymentRow = await this.prisma.payment.findFirst({
      where: {
        orderId: id,
        tenantId: store.tenantId,
        establishmentId: store.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    let payment: {
      id: string;
      provider: string | null;
      method: string;
      status: string;
      amount: number;
      paidAt: Date | null;
      transactionId: string | null;
      qrCode: string | null;
      qrCodeBase64: string | null;
    } | null = null;

    if (paymentRow) {
      const raw = paymentRow.rawPayload as {
        point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } };
      } | null;
      const pointOfInteraction = raw?.point_of_interaction?.transaction_data;
      payment = {
        id: paymentRow.id,
        provider: paymentRow.provider,
        method: paymentRow.method,
        status: paymentRow.status,
        amount: Number(paymentRow.amount),
        paidAt: paymentRow.paidAt,
        transactionId: paymentRow.transactionId,
        qrCode: pointOfInteraction?.qr_code ?? null,
        qrCodeBase64: pointOfInteraction?.qr_code_base64 ?? null,
      };
    }

    return { order, payment };
  }
}
