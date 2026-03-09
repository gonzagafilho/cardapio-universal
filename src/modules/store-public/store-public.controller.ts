import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StorePublicService } from './store-public.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('public')
@Controller('public/store')
export class StorePublicController {
  constructor(private readonly storePublicService: StorePublicService) {}

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Dados da loja pelo slug' })
  getStore(@Param('slug') slug: string) {
    return this.storePublicService.getStoreBySlug(slug);
  }

  @Get(':slug/categories')
  @Public()
  @ApiOperation({ summary: 'Categorias da loja' })
  getCategories(@Param('slug') slug: string) {
    return this.storePublicService.getStoreBySlug(slug).then((store) =>
      this.storePublicService.getCategories(store.tenantId, store.id),
    );
  }

  @Get(':slug/products')
  @Public()
  @ApiOperation({ summary: 'Produtos da loja' })
  getProducts(@Param('slug') slug: string) {
    return this.storePublicService.getStoreBySlug(slug).then((store) =>
      this.storePublicService.getProducts(store.tenantId, store.id),
    );
  }

  @Get(':slug/products/:id')
  @Public()
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
  @ApiOperation({ summary: 'Configurações da loja (cores, horários)' })
  getSettings(@Param('slug') slug: string) {
    return this.storePublicService.getStoreBySlug(slug).then((store) =>
      this.storePublicService.getSettings(store.tenantId, store.id),
    );
  }
}
