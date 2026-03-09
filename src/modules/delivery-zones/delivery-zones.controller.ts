import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeliveryZonesService } from './delivery-zones.service';
import { CreateDeliveryZoneDto, UpdateDeliveryZoneDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('delivery-zones')
@ApiBearerAuth('access-token')
@Controller('delivery-zones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryZonesController {
  constructor(private readonly deliveryZonesService: DeliveryZonesService) {}

  @Post()
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Criar zona de entrega' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateDeliveryZoneDto,
    @Query('establishmentId') establishmentId: string,
  ) {
    return this.deliveryZonesService.create(tenantId, establishmentId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar zonas' })
  findAll(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId?: string,
  ) {
    return this.deliveryZonesService.findAll(tenantId, establishmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar zona' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.deliveryZonesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar zona' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryZoneDto,
  ) {
    return this.deliveryZonesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Remover zona' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.deliveryZonesService.remove(tenantId, id);
  }
}
