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
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('coupons')
@ApiBearerAuth('access-token')
@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Criar cupom' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateCouponDto,
    @Query('establishmentId') establishmentId: string,
  ) {
    return this.couponsService.create(tenantId, establishmentId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cupons' })
  findAll(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId?: string,
  ) {
    return this.couponsService.findAll(tenantId, establishmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cupom' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.couponsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar cupom' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Remover cupom' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.couponsService.remove(tenantId, id);
  }
}
