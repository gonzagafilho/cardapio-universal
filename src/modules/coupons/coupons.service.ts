import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DiscountType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Decimal } from '@prisma/client/runtime/library';

const DISCOUNT_TYPE_MAP: Record<string, DiscountType> = {
  percentage: DiscountType.PERCENTAGE,
  fixed: DiscountType.FIXED,
};

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, establishmentId: string | null, dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: {
        tenantId_code: { tenantId, code: dto.code.toUpperCase() },
      },
    });
    if (existing) throw new ConflictException('Código já existe');
    const discountType = DISCOUNT_TYPE_MAP[dto.type] ?? DiscountType.FIXED;
    return this.prisma.coupon.create({
      data: {
        tenantId,
        establishmentId: establishmentId ?? undefined,
        code: dto.code.toUpperCase(),
        discountType,
        discountValue: new Decimal(dto.value),
        minOrderValue: dto.minOrderValue != null ? new Decimal(dto.minOrderValue) : undefined,
        maxDiscountValue: dto.maxDiscount != null ? new Decimal(dto.maxDiscount) : undefined,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
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
    if (dto.value != null) data.discountValue = new Decimal(dto.value);
    if (dto.minOrderValue != null) data.minOrderValue = new Decimal(dto.minOrderValue);
    if (dto.maxDiscount != null) data.maxDiscountValue = new Decimal(dto.maxDiscount);
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
