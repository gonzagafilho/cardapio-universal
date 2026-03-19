import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';
import { MasterServicesService } from './master-services.service';

@ApiTags('master-services')
@ApiBearerAuth('access-token')
@Controller('master-services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.SUPER_ADMIN)
export class MasterServicesController {
  constructor(private readonly masterServicesService: MasterServicesService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Catálogo global de serviços (somente leitura)' })
  getCatalog() {
    return this.masterServicesService.getCatalog();
  }

  @Get('tenants/:tenantId/services')
  @ApiOperation({ summary: 'Serviços vinculados a um tenant (somente leitura)' })
  getTenantServices(@Param('tenantId') tenantId: string) {
    return this.masterServicesService.getTenantServices(tenantId);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Visão geral do painel mestre (somente leitura)' })
  getOverview() {
    return this.masterServicesService.getOverview();
  }
}
