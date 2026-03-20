import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateServiceCatalogDto,
  CreateTenantServiceBindingDto,
  UpdateServiceCatalogDto,
  UpdateTenantServiceBindingDto,
} from './dto';

@Injectable()
export class MasterServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCatalogService(dto: CreateServiceCatalogDto) {
    const key = dto.key.trim().toLowerCase();
    const existing = await this.prisma.serviceCatalog.findUnique({ where: { key } });
    if (existing) throw new ConflictException('Já existe serviço com esta key');

    return this.prisma.serviceCatalog.create({
      data: {
        key,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateCatalogService(id: string, dto: UpdateServiceCatalogDto) {
    const existing = await this.prisma.serviceCatalog.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Serviço não encontrado');

    const data: {
      key?: string;
      name?: string;
      description?: string | null;
      isActive?: boolean;
    } = {};
    if (dto.key != null) data.key = dto.key.trim().toLowerCase();
    if (dto.name != null) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.serviceCatalog.update({
      where: { id },
      data,
    });
  }

  async getCatalog() {
    return this.prisma.serviceCatalog.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { tenantBindings: true } },
      },
    });
  }

  async getTenantServices(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, isActive: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const bindings = await this.prisma.tenantServiceBinding.findMany({
      where: { tenantId },
      orderBy: [{ createdAt: 'desc' }],
      select: {
        id: true,
        tenantId: true,
        serviceCatalogId: true,
        status: true,
        plan: true,
        notes: true,
        activatedAt: true,
        suspendedAt: true,
        createdAt: true,
        updatedAt: true,
        service: {
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
        billingInvoices: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            amountCents: true,
            status: true,
            pixCode: true,
            pixQrCodeUrl: true,
            externalChargeId: true,
            expiresAt: true,
            paidAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return { tenant, bindings };
  }

  async bindServiceToTenant(tenantId: string, dto: CreateTenantServiceBindingDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const service = await this.prisma.serviceCatalog.findUnique({
      where: { id: dto.serviceCatalogId },
      select: { id: true },
    });
    if (!service) throw new NotFoundException('Serviço do catálogo não encontrado');

    const existing = await this.prisma.tenantServiceBinding.findUnique({
      where: {
        tenantId_serviceCatalogId: {
          tenantId,
          serviceCatalogId: dto.serviceCatalogId,
        },
      },
    });
    if (existing) throw new ConflictException('Tenant já possui vínculo com este serviço');

    const status = dto.status ?? 'active';

    return this.prisma.tenantServiceBinding.create({
      data: {
        tenantId,
        serviceCatalogId: dto.serviceCatalogId,
        status,
        plan: dto.plan?.trim() || null,
        notes: dto.notes?.trim() || null,
        activatedAt: dto.activatedAt ? new Date(dto.activatedAt) : null,
      },
      include: {
        service: {
          select: { id: true, key: true, name: true, description: true, isActive: true },
        },
      },
    });
  }

  async updateTenantServiceBinding(
    tenantId: string,
    bindingId: string,
    dto: UpdateTenantServiceBindingDto,
  ) {
    const existing = await this.prisma.tenantServiceBinding.findFirst({
      where: { id: bindingId, tenantId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Vínculo não encontrado para este tenant');

    const data: {
      status?: string;
      plan?: string | null;
      notes?: string | null;
      activatedAt?: Date | null;
      suspendedAt?: Date | null;
    } = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.plan !== undefined) data.plan = dto.plan?.trim() || null;
    if (dto.notes !== undefined) data.notes = dto.notes?.trim() || null;
    if (dto.activatedAt !== undefined) data.activatedAt = dto.activatedAt ? new Date(dto.activatedAt) : null;
    if (dto.suspendedAt !== undefined) data.suspendedAt = dto.suspendedAt ? new Date(dto.suspendedAt) : null;

    if (data.status === 'suspended' && data.suspendedAt === undefined) {
      data.suspendedAt = new Date();
    }

    return this.prisma.tenantServiceBinding.update({
      where: { id: bindingId },
      data,
      include: {
        service: {
          select: { id: true, key: true, name: true, description: true, isActive: true },
        },
      },
    });
  }

  async getOverview() {
    const [servicesTotal, servicesActive, tenantsTotal, tenantsActive, bindingsTotal] =
      await Promise.all([
        this.prisma.serviceCatalog.count(),
        this.prisma.serviceCatalog.count({ where: { isActive: true } }),
        this.prisma.tenant.count(),
        this.prisma.tenant.count({ where: { isActive: true } }),
        this.prisma.tenantServiceBinding.count(),
      ]);

    return {
      servicesTotal,
      servicesActive,
      tenantsTotal,
      tenantsActive,
      bindingsTotal,
      timestamp: new Date().toISOString(),
    };
  }
}
