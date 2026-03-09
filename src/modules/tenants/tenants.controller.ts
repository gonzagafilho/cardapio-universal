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
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('tenants')
@ApiBearerAuth('access-token')
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles(ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Criar tenant' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER)
  @ApiOperation({ summary: 'Listar tenants' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.tenantsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tenant' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tenantsService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tenant' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remover tenant' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tenantsService.remove(user, id);
  }
}
