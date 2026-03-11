import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { Weekday } from '@prisma/client';

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

    const byCustomDomain = await this.prisma.establishment.findFirst({
      where: { customDomain: normalized, isActive: true },
      include: { tenant: { select: { name: true, primaryColor: true, secondaryColor: true } } },
    });
    if (byCustomDomain) return byCustomDomain;

    const baseDomain = this.config.get<string>('SUBDOMAIN_BASE_DOMAIN') ?? '';
    const slug = extractSubdomainSlug(normalized, baseDomain);
    if (slug) {
      try {
        return await this.getStoreBySlug(slug);
      } catch {
        return null;
      }
    }
    return null;
  }

  async getStoreBySlug(slug: string) {
    const establishment = await this.prisma.establishment.findFirst({
      where: { slug, isActive: true },
      include: { tenant: { select: { name: true, primaryColor: true, secondaryColor: true } } },
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
    return rows.map((row) => mapProductToPublic(row));
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
    return mapProductToPublic(product);
  }

  async getSettings(tenantId: string, establishmentId: string) {
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
      openHours[key] = h.isClosed || h.openTime == null || h.closeTime == null
        ? null
        : { open: h.openTime, close: h.closeTime };
    }

    const base = settings ?? {};
    const minimumOrder = settings?.minimumOrderAmount != null ? Number(settings.minimumOrderAmount) : undefined;
    const minimumOrderDelivery =
      settings?.minimumOrderAmountDelivery != null ? Number(settings.minimumOrderAmountDelivery) : undefined;
    const deliveryEstimate =
      settings?.estimatedDeliveryTimeMin != null || settings?.estimatedDeliveryTimeMax != null
        ? settings?.estimatedDeliveryTimeMax ?? settings?.estimatedDeliveryTimeMin ?? undefined
        : undefined;

    return {
      ...base,
      primaryColor: tenant?.primaryColor ?? undefined,
      secondaryColor: tenant?.secondaryColor ?? undefined,
      openHours: Object.keys(openHours).length ? openHours : undefined,
      minimumOrder,
      minimumOrderDelivery,
      deliveryEstimate: deliveryEstimate != null ? Number(deliveryEstimate) : undefined,
    };
  }
}
