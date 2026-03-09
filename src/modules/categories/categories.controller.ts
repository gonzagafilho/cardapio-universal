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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, ReorderCategoriesDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('categories')
@ApiBearerAuth('access-token')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Criar categoria' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateCategoryDto,
    @Query('establishmentId') establishmentId: string,
  ) {
    return this.categoriesService.create(tenantId, establishmentId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias' })
  findAll(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId?: string,
  ) {
    return this.categoriesService.findAll(tenantId, establishmentId);
  }

  @Patch('reorder')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Reordenar categorias' })
  reorder(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Body() dto: ReorderCategoriesDto,
  ) {
    return this.categoriesService.reorder(tenantId, establishmentId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.categoriesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar categoria' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Remover categoria' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.categoriesService.remove(tenantId, id);
  }
}
