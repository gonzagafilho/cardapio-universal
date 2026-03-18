import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { StorePublicService } from './store-public.service';
import { Public } from '../../common/decorators/public.decorator';
import { UpsertPublicCartItemDto } from './dto/upsert-public-cart-item.dto';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';

@ApiTags('public')
@Controller('public/store')
@UseGuards(ThrottlerGuard)
export class StorePublicController {
  constructor(private readonly storePublicService: StorePublicService) {}

  @Get('by-host')
  @Public()
  @Throttle({ publicRead: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Dados da loja pelo domínio personalizado (query host=)' })
  getStoreByHost(@Query('host') host: string) {
    return this.storePublicService.getStoreByHost(host).then((store) => {
      if (!store) throw new NotFoundException('Loja não encontrada');
      return store;
    });
  }

  @Get(':slug')
  @Public()
  @Throttle({ publicRead: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Dados da loja pelo slug' })
  getStore(@Param('slug') slug: string) {
    return this.storePublicService.getStoreBySlug(slug);
  }

  @Get(':slug/categories')
  @Public()
  @Throttle({ publicRead: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Categorias da loja' })
  getCategories(@Param('slug') slug: string) {
    return this.storePublicService.getStoreBySlug(slug).then((store) =>
      this.storePublicService.getCategories(store.tenantId, store.id),
    );
  }

  @Get(':slug/products')
  @Public()
  @Throttle({ publicRead: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Produtos da loja' })
  getProducts(@Param('slug') slug: string) {
    return this.storePublicService.getStoreBySlug(slug).then((store) =>
      this.storePublicService.getProducts(store.tenantId, store.id),
    );
  }

  @Get(':slug/products/:id')
  @Public()
  @Throttle({ publicRead: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Produto por ID' })
  getProduct(
    @Param('slug') slug: string,
    @Param('id') id: string,
  ) {
    return this.storePublicService.getStoreBySlug(slug).then((store) =>
      this.storePublicService.getProduct(store.tenantId, store.id, id),
    );
  }

  @Get(':slug/settings')
  @Public()
  @Throttle({ publicRead: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Configurações da loja (cores, horários)' })
  getSettings(@Param('slug') slug: string) {
    return this.storePublicService.getStoreBySlug(slug).then((store) =>
      this.storePublicService.getSettings(store.tenantId, store.id),
    );
  }

  @Get(':slug/table')
  @Public()
  @Throttle({ publicRead: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Resolver mesa/comanda por token (?token=)' })
  getTableByToken(
    @Param('slug') slug: string,
    @Query('token') token: string,
  ) {
    return this.storePublicService.getStoreBySlug(slug).then((store) =>
      this.storePublicService.getTableByToken(store.tenantId, store.id, token),
    );
  }

  @Post(':slug/cart')
  @Public()
  @Throttle({ publicWrite: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Criar/atualizar carrinho público' })
  upsertCart(
    @Param('slug') slug: string,
    @Body() dto: UpsertPublicCartItemDto,
  ) {
    return this.storePublicService.upsertCartItem(slug, dto);
  }

  @Post(':slug/cart/item')
  @Public()
  @Throttle({ publicWrite: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Adicionar/atualizar item no carrinho público' })
  upsertCartItem(
    @Param('slug') slug: string,
    @Body() dto: UpsertPublicCartItemDto,
  ) {
    return this.storePublicService.upsertCartItem(slug, dto);
  }

  @Get(':slug/cart/:sessionId')
  @Public()
  @Throttle({ publicRead: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Buscar carrinho público por sessionId' })
  getCart(
    @Param('slug') slug: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.storePublicService.getPublicCart(slug, sessionId);
  }

  @Delete(':slug/cart/item/:itemId')
  @Public()
  @Throttle({ publicWrite: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Remover item do carrinho público' })
  removeCartItem(
    @Param('slug') slug: string,
    @Param('itemId') itemId: string,
    @Query('sessionId') sessionId: string,
  ) {
    return this.storePublicService.removeCartItem(slug, sessionId, itemId);
  }

  @Post(':slug/order')
  @Public()
  @Throttle({ publicWrite: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Criar pedido público a partir do carrinho' })
  createPublicOrder(
    @Param('slug') slug: string,
    @Body() dto: CreatePublicOrderDto,
  ) {
    return this.storePublicService.createPublicOrder(slug, dto);
  }

  @Get(':slug/order/:id')
  @Public()
  @Throttle({ publicRead: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Buscar pedido público por ID' })
  getPublicOrder(
    @Param('slug') slug: string,
    @Param('id') id: string,
  ) {
    return this.storePublicService.getPublicOrder(slug, id);
  }
}
