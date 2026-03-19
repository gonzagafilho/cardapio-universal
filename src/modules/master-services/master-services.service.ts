import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MasterServicesService {
  constructor(private readonly prisma: PrismaService) {}

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
      },
    });

    return { tenant, bindings };
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
