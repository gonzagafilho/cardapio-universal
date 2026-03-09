import { Module } from '@nestjs/common';
import { StorePublicService } from './store-public.service';
import { StorePublicController } from './store-public.controller';

@Module({
  controllers: [StorePublicController],
  providers: [StorePublicService],
  exports: [StorePublicService],
})
export class StorePublicModule {}
