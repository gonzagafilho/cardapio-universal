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
    if (dto.minimumOrder != null) data.minimumOrder = new Decimal(dto.minimumOrder);
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
    tenantId: string,
    establishmentId: string,
    openHours: Record<string, { open: string; close: string }>,
  ) {
    return this.prisma.storeSettings.upsert({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
      create: { tenantId, establishmentId, openHours: openHours as never },
      update: { openHours: openHours as never },
    });
  }

  async updateBranding(
    tenantId: string,
    establishmentId: string,
    data: { primaryColor?: string; secondaryColor?: string; accentColor?: string },
  ) {
    return this.prisma.storeSettings.upsert({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
      create: { tenantId, establishmentId, ...data },
      update: data,
    });
  }

  async updatePaymentMethods(
    tenantId: string,
    establishmentId: string,
    data: { pixKey?: string },
  ) {
    return this.prisma.storeSettings.upsert({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
      create: { tenantId, establishmentId, ...data },
      update: data,
    });
  }

  async updateDelivery(
    tenantId: string,
    establishmentId: string,
    data: {
      acceptsDelivery?: boolean;
      minimumOrder?: number;
      deliveryEstimate?: number;
    },
  ) {
    const update: Record<string, unknown> = { ...data };
    if (data.minimumOrder != null) update.minimumOrder = new Decimal(data.minimumOrder);
    return this.prisma.storeSettings.upsert({
      where: { tenantId_establishmentId: { tenantId, establishmentId } },
      create: { tenantId, establishmentId, ...(update as object) },
      update: update as never,
    });
  }
}
