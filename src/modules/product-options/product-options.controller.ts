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
import { ProductOptionsService } from './product-options.service';
import {
  CreateOptionGroupDto,
  UpdateOptionGroupDto,
  CreateOptionItemDto,
  UpdateOptionItemDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('product-options')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductOptionsController {
  constructor(private readonly productOptionsService: ProductOptionsService) {}

  @Get('products/:productId/options')
  @ApiOperation({ summary: 'Listar opções do produto' })
  findGroupsByProduct(
    @TenantId() tenantId: string,
    @Param('productId') productId: string,
  ) {
    return this.productOptionsService.findGroupsByProduct(tenantId, productId);
  }

  @Post('products/:productId/options')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Criar grupo de opções' })
  createGroup(
    @TenantId() tenantId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateOptionGroupDto,
  ) {
    return this.productOptionsService.createGroup(tenantId, productId, dto);
  }

  @Patch('product-options/groups/:id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar grupo de opções' })
  updateGroup(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOptionGroupDto,
  ) {
    return this.productOptionsService.updateGroup(tenantId, id, dto);
  }

  @Delete('product-options/groups/:id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Remover grupo de opções' })
  removeGroup(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.productOptionsService.removeGroup(tenantId, id);
  }

  @Post('product-options/groups/:groupId/items')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Criar item de opção' })
  createItem(
    @TenantId() tenantId: string,
    @Param('groupId') groupId: string,
    @Body() dto: CreateOptionItemDto,
  ) {
    return this.productOptionsService.createItem(tenantId, groupId, dto);
  }

  @Patch('product-options/items/:id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar item de opção' })
  updateItem(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOptionItemDto,
  ) {
    return this.productOptionsService.updateItem(tenantId, id, dto);
  }

  @Delete('product-options/items/:id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Remover item de opção' })
  removeItem(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.productOptionsService.removeItem(tenantId, id);
  }
}
