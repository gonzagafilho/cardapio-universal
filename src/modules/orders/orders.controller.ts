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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ROLES } from '../../common/constants/roles';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

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
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10) || 50)) : 50;
    return this.ordersService.findAll(tenantId, establishmentId, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.findOne(tenantId, id, {
      establishmentId: user.establishmentId,
      role: user.role,
    });
  }

  @Patch(':id/status')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.updateStatus(tenantId, id, status as never, {
      establishmentId: user.establishmentId,
      role: user.role,
    });
  }

  @Patch(':id/cancel')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Cancelar pedido' })
  cancel(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.cancel(tenantId, id, {
      establishmentId: user.establishmentId,
      role: user.role,
    });
  }

  @Patch(':id/confirm')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Confirmar pedido' })
  confirm(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.confirm(tenantId, id, {
      establishmentId: user.establishmentId,
      role: user.role,
    });
  }

  @Patch(':id/ready')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Marcar pedido pronto' })
  ready(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.ready(tenantId, id, {
      establishmentId: user.establishmentId,
      role: user.role,
    });
  }

  @Patch(':id/out-for-delivery')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Saiu para entrega' })
  outForDelivery(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.outForDelivery(tenantId, id, {
      establishmentId: user.establishmentId,
      role: user.role,
    });
  }

  @Patch(':id/delivered')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER, ROLES.ATTENDANT)
  @ApiOperation({ summary: 'Marcar como entregue' })
  delivered(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.delivered(tenantId, id, {
      establishmentId: user.establishmentId,
      role: user.role,
    });
  }
}
