import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { StorePublicService } from './store-public.service';
import { StorePublicController } from './store-public.controller';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [ThrottlerModule, OrdersModule, PaymentsModule],
  controllers: [StorePublicController],
  providers: [StorePublicService],
  exports: [StorePublicService],
})
export class StorePublicModule {}