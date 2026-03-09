import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT, ROLES.OPERATOR)
  @ApiOperation({ summary: 'Criar pedido' })
  create(@TenantId() tenantId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos' })
  findAll(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId?: string,
  ) {
    return this.ordersService.findAll(tenantId, establishmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.ordersService.findOne(tenantId, id);
  }

  @Patch(':id/status')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(tenantId, id, status as never);
  }

  @Patch(':id/cancel')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Cancelar pedido' })
  cancel(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.ordersService.cancel(tenantId, id);
  }

  @Patch(':id/confirm')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Confirmar pedido' })
  confirm(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.ordersService.confirm(tenantId, id);
  }

  @Patch(':id/ready')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Marcar pedido pronto' })
  ready(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.ordersService.ready(tenantId, id);
  }

  @Patch(':id/out-for-delivery')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Saiu para entrega' })
  outForDelivery(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.ordersService.outForDelivery(tenantId, id);
  }

  @Patch(':id/delivered')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Marcar como entregue' })
  delivered(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.ordersService.delivered(tenantId, id);
  }
}
