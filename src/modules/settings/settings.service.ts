import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateStoreSettingsDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

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
    if (dto.minimumOrder != null) data.minimumOrderAmount = new Decimal(dto.minimumOrder);
    if (dto.minimumOrderDelivery != null) data.minimumOrderAmountDelivery = new Decimal(dto.minimumOrderDelivery);
    delete data.minimumOrder;
    delete data.minimumOrderDelivery;
    delete data.primaryColor;
    delete data.secondaryColor;
    delete data.accentColor;
    delete data.pixKey;
    delete data.deliveryEstimate;
    return this.prisma.storeSettings.upsert({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
      create: {
        tenantId,
        establishmentId,
        ...(data as object),
      },
      update: data as never,
    });
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
    _data: { primaryColor?: string; secondaryColor?: string; accentColor?: string },
  ) {
    const settings = await this.getStore(tenantId, establishmentId);
    return settings;
  }

  async updatePaymentMethods(
    tenantId: string,
    establishmentId: string,
    _data: { pixKey?: string },
  ) {
    const settings = await this.getStore(tenantId, establishmentId);
    return settings;
  }

  async updateDelivery(
    tenantId: string,
    establishmentId: string,
    data: {
      acceptsDelivery?: boolean;
      minimumOrder?: number;
      minimumOrderDelivery?: number;
      deliveryEstimate?: number;
    },
  ) {
    const update: Record<string, unknown> = {};
    if (data.acceptsDelivery != null) update.acceptsDelivery = data.acceptsDelivery;
    if (data.minimumOrder != null) update.minimumOrderAmount = new Decimal(data.minimumOrder);
    if (data.minimumOrderDelivery != null) update.minimumOrderAmountDelivery = new Decimal(data.minimumOrderDelivery);
    if (data.deliveryEstimate != null) {
      update.estimatedDeliveryTimeMin = data.deliveryEstimate;
      update.estimatedDeliveryTimeMax = data.deliveryEstimate;
    }
    return this.prisma.storeSettings.upsert({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
      create: { tenantId, establishmentId, ...update },
      update,
    });
  }
}
