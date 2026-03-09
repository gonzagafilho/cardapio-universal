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
import { CartsService } from './carts.service';
import {
  CreateCartDto,
  AddCartItemDto,
  UpdateCartItemDto,
  ApplyCouponDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Criar carrinho' })
  create(
    @Body() dto: CreateCartDto,
    @TenantId() tenantId?: string,
  ) {
    return this.cartsService.create(tenantId ?? null, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar carrinho' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.cartsService.findOne(tenantId, id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  addItem(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartsService.addItem(tenantId, id, dto);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Atualizar item do carrinho' })
  updateItem(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartsService.updateItem(tenantId, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  removeItem(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartsService.removeItem(tenantId, id, itemId);
  }

  @Post(':id/apply-coupon')
  @ApiOperation({ summary: 'Aplicar cupom' })
  applyCoupon(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ApplyCouponDto,
  ) {
    return this.cartsService.applyCoupon(tenantId, id, dto.code);
  }

  @Post(':id/remove-coupon')
  @ApiOperation({ summary: 'Remover cupom' })
  removeCoupon(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.cartsService.removeCoupon(tenantId, id);
  }

  @Post(':id/calculate')
  @ApiOperation({ summary: 'Recalcular carrinho' })
  calculate(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.cartsService.calculateCart(tenantId, id);
  }
}
