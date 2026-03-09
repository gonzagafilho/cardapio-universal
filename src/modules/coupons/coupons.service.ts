import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, establishmentId: string, dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: {
        tenantId_establishmentId_code: {
          tenantId,
          establishmentId,
          code: dto.code.toUpperCase(),
        },
      },
    });
    if (existing) throw new ConflictException('Código já existe');
    return this.prisma.coupon.create({
      data: {
        tenantId,
        establishmentId,
        code: dto.code.toUpperCase(),
        type: dto.type,
        value: new Decimal(dto.value),
        minOrderValue: dto.minOrderValue != null ? new Decimal(dto.minOrderValue) : undefined,
        maxDiscount: dto.maxDiscount != null ? new Decimal(dto.maxDiscount) : undefined,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        usageLimit: dto.usageLimit,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(tenantId: string, establishmentId?: string) {
    return this.prisma.coupon.findMany({
      where: { tenantId, ...(establishmentId && { establishmentId }) },
      orderBy: { startsAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { id, tenantId },
    });
    if (!coupon) throw new NotFoundException('Cupom não encontrado');
    return coupon;
  }

  async update(tenantId: string, id: string, dto: UpdateCouponDto) {
    await this.findOne(tenantId, id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.value != null) data.value = new Decimal(dto.value);
    if (dto.minOrderValue != null) data.minOrderValue = new Decimal(dto.minOrderValue);
    if (dto.maxDiscount != null) data.maxDiscount = new Decimal(dto.maxDiscount);
    if (dto.startsAt != null) data.startsAt = new Date(dto.startsAt);
    if (dto.endsAt != null) data.endsAt = new Date(dto.endsAt);
    if (dto.code) data.code = dto.code.toUpperCase();
    return this.prisma.coupon.update({
      where: { id },
      data: data as never,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Cupom removido' };
  }
}
