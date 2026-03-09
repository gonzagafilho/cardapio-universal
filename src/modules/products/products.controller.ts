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
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ReorderProductsDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('products')
@ApiBearerAuth('access-token')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Criar produto' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateProductDto,
    @Query('establishmentId') establishmentId: string,
  ) {
    return this.productsService.create(tenantId, establishmentId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar produtos' })
  findAll(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.findAll(tenantId, establishmentId, categoryId);
  }

  @Patch('reorder')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Reordenar produtos' })
  reorder(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Body() dto: ReorderProductsDto,
  ) {
    return this.productsService.reorder(tenantId, establishmentId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.productsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar produto' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(tenantId, id, dto);
  }

  @Patch(':id/status')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar status do produto' })
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.productsService.updateStatus(tenantId, id, isActive);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Remover produto' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.productsService.remove(tenantId, id);
  }
}
