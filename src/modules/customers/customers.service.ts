import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, establishmentId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        tenantId,
        establishmentId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        cpf: dto.cpf,
      },
    });
  }

  async findAll(tenantId: string, establishmentId?: string) {
    return this.prisma.customer.findMany({
      where: { tenantId, ...(establishmentId && { establishmentId }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
    });
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    return customer;
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async findOrders(tenantId: string, customerId: string) {
    await this.findOne(tenantId, customerId);
    return this.prisma.order.findMany({
      where: { customerId, tenantId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }
}
