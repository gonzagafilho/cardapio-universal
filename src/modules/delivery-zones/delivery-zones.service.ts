import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DeliveryZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, establishmentId: string, dto: CreateDeliveryZoneDto) {
    return this.prisma.deliveryZone.create({
      data: {
        tenantId,
        establishmentId,
        name: dto.name,
        type: dto.type,
        fee: new Decimal(dto.fee),
        minTime: dto.minTime,
        maxTime: dto.maxTime,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(tenantId: string, establishmentId?: string) {
    return this.prisma.deliveryZone.findMany({
      where: { tenantId, ...(establishmentId && { establishmentId }) },
    });
  }

  async findOne(tenantId: string, id: string) {
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { id, tenantId },
    });
    if (!zone) throw new NotFoundException('Zona não encontrada');
    return zone;
  }

  async update(tenantId: string, id: string, dto: UpdateDeliveryZoneDto) {
    await this.findOne(tenantId, id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.fee != null) data.fee = new Decimal(dto.fee);
    return this.prisma.deliveryZone.update({
      where: { id },
      data: data as never,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.deliveryZone.delete({ where: { id } });
    return { message: 'Zona removida' };
  }
}
