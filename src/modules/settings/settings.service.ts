import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { UpdateStoreSettingsDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getStore(tenantId: string, establishmentId: string) {
    const settings = await this.prisma.storeSettings.findUnique({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
    });

    if (!settings) {
      return this.prisma.storeSettings.create({
        data: {
          tenantId,
          establishmentId,
        },
      });
    }

    return settings;
  }

  async updateStore(
    tenantId: string,
    establishmentId: string,
    dto: UpdateStoreSettingsDto,
  ) {
    const data: Record<string, unknown> = { ...dto };

    if (dto.minimumOrder != null) {
      data.minimumOrderAmount = new Decimal(dto.minimumOrder);
    }

    if (dto.minimumOrderDelivery != null) {
      data.minimumOrderAmountDelivery = new Decimal(dto.minimumOrderDelivery);
    }

    if (dto.deliveryFee != null) {
      data.deliveryFee = new Decimal(dto.deliveryFee);
    }

    delete data.minimumOrder;
    delete data.minimumOrderDelivery;
    delete data.primaryColor;
    delete data.secondaryColor;
    delete data.accentColor;
    delete data.pixKey;
    delete data.deliveryEstimate;
    delete data.paymentPix;
    delete data.paymentCardOnDelivery;
    delete data.paymentCardOnCounter;
    delete data.deliveryFee;

    const result = await this.prisma.storeSettings.upsert({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
      create: {
        tenantId,
        establishmentId,
        ...(data as object),
      },
      update: data as never,
    });
    await this.cache.del(`store:${establishmentId}:settings`);
    return result;
  }

  async updateHours(
    _tenantId: string,
    _establishmentId: string,
    _openHours: Record<string, { open: string; close: string }>,
  ) {
    // Horários ficam em EstablishmentWorkingHours; não em StoreSettings.
    return Promise.resolve(undefined);
  }

  async updateBranding(
    tenantId: string,
    establishmentId: string,
    _data: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
    },
  ) {
    const settings = await this.getStore(tenantId, establishmentId);
    return settings;
  }

  async updatePaymentMethods(
    tenantId: string,
    establishmentId: string,
    data: {
      paymentPix?: boolean;
      paymentCardOnDelivery?: boolean;
      paymentCardOnCounter?: boolean;
    },
  ) {
    const update: Record<string, unknown> = {};

    if (data.paymentPix != null) {
      update.paymentPix = data.paymentPix;
    }

    if (data.paymentCardOnDelivery != null) {
      update.paymentCardOnDelivery = data.paymentCardOnDelivery;
    }

    if (data.paymentCardOnCounter != null) {
      update.paymentCardOnCounter = data.paymentCardOnCounter;
    }

    const result = await this.prisma.storeSettings.upsert({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
      create: {
        tenantId,
        establishmentId,
        ...update,
      },
      update,
    });
    await this.cache.del(`store:${establishmentId}:settings`);
    return result;
  }

  async updateDelivery(
    tenantId: string,
    establishmentId: string,
    data: {
      acceptsDelivery?: boolean;
      acceptsPickup?: boolean;
      acceptsDineIn?: boolean;
      deliveryFee?: number;
      minimumOrderAmount?: number;
      minimumOrderAmountDelivery?: number;
      estimatedDeliveryTimeMin?: number;
      estimatedDeliveryTimeMax?: number;
    },
  ) {
    const update: Record<string, unknown> = {};

    if (data.acceptsDelivery != null) {
      update.acceptsDelivery = data.acceptsDelivery;
    }

    if (data.acceptsPickup != null) {
      update.acceptsPickup = data.acceptsPickup;
    }

    if (data.acceptsDineIn != null) {
      update.acceptsDineIn = data.acceptsDineIn;
    }

    if (data.deliveryFee != null) {
      update.deliveryFee = new Decimal(data.deliveryFee);
    }

    if (data.minimumOrderAmount != null) {
      update.minimumOrderAmount = new Decimal(data.minimumOrderAmount);
    }

    if (data.minimumOrderAmountDelivery != null) {
      update.minimumOrderAmountDelivery = new Decimal(
        data.minimumOrderAmountDelivery,
      );
    }

    if (data.estimatedDeliveryTimeMin != null) {
      update.estimatedDeliveryTimeMin = data.estimatedDeliveryTimeMin;
    }

    if (data.estimatedDeliveryTimeMax != null) {
      update.estimatedDeliveryTimeMax = data.estimatedDeliveryTimeMax;
    }

    const result = await this.prisma.storeSettings.upsert({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
      create: {
        tenantId,
        establishmentId,
        ...update,
      },
      update,
    });
    await this.cache.del(`store:${establishmentId}:settings`);
    return result;
  }
}