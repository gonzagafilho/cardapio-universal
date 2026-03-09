import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('audit')
@ApiBearerAuth('access-token')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER)
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  findAll(@TenantId() tenantId: string, @Query('limit') limit?: string) {
    return this.auditService.findAll(tenantId, limit ? parseInt(limit, 10) : 100);
  }
}
