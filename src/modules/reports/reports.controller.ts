import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('reports')
@ApiBearerAuth('access-token')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Resumo de vendas' })
  salesSummary(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.salesSummary(
      tenantId,
      establishmentId,
      new Date(start),
      new Date(end),
    );
  }

  @Get('orders-by-day')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Pedidos por dia' })
  ordersByDay(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.ordersByDay(
      tenantId,
      establishmentId,
      new Date(start),
      new Date(end),
    );
  }

  @Get('top-products')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Produtos mais vendidos' })
  topProducts(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.topProducts(
      tenantId,
      establishmentId,
      new Date(start),
      new Date(end),
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('payment-methods')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Vendas por forma de pagamento' })
  paymentMethods(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.paymentMethods(
      tenantId,
      establishmentId,
      new Date(start),
      new Date(end),
    );
  }

  @Get('customers')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Relatório de clientes' })
  customers(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
  ) {
    return this.reportsService.customersReport(tenantId, establishmentId);
  }

  @Get('cancelled-orders')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Pedidos cancelados' })
  cancelledOrders(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.cancelledOrders(
      tenantId,
      establishmentId,
      new Date(start),
      new Date(end),
    );
  }

  @Get('dashboard')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Dashboard resumido' })
  dashboard(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
  ) {
    return this.reportsService.dashboard(tenantId, establishmentId);
  }
}
