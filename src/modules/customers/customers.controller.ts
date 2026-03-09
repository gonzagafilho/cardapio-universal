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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('customers')
@ApiBearerAuth('access-token')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Criar cliente' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateCustomerDto,
    @Query('establishmentId') establishmentId: string,
  ) {
    return this.customersService.create(tenantId, establishmentId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  findAll(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId?: string,
  ) {
    return this.customersService.findAll(tenantId, establishmentId);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Pedidos do cliente' })
  findOrders(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.customersService.findOrders(tenantId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.customersService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(tenantId, id, dto);
  }
}
