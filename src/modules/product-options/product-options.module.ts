import { Module } from '@nestjs/common';
import { ProductOptionsService } from './product-options.service';
import { ProductOptionsController } from './product-options.controller';

@Module({
  controllers: [ProductOptionsController],
  providers: [ProductOptionsService],
  exports: [ProductOptionsService],
})
export class ProductOptionsModule {}
