import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EstablishmentsService } from './establishments.service';
import { CreateEstablishmentDto, UpdateEstablishmentDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('establishments')
@ApiBearerAuth('access-token')
@Controller('establishments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @Post()
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER)
  @ApiOperation({ summary: 'Criar estabelecimento' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateEstablishmentDto,
  ) {
    return this.establishmentsService.create(tenantId, dto);
  }

  @Get()
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Listar estabelecimentos' })
  findAll(@TenantId() tenantId: string, @CurrentUser() user: JwtPayload) {
    return this.establishmentsService.findAll(tenantId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar estabelecimento' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.establishmentsService.findOne(tenantId, id, user);
  }

  @Patch(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar estabelecimento' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEstablishmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.establishmentsService.update(tenantId, id, dto, user);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER)
  @ApiOperation({ summary: 'Remover estabelecimento' })
  remove(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.establishmentsService.remove(tenantId, id, user);
  }
}
