import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentWebhookProcessor, PAYMENTS_WEBHOOK_QUEUE } from './payment-webhook.processor';
import { OrdersModule } from '../orders/orders.module';

const redisUrl = process.env.REDIS_URL?.trim() ?? '';
const useBullQueue = redisUrl.startsWith('redis://');

@Module({
  imports: [
    OrdersModule,
    ...(useBullQueue ? [BullModule.registerQueue({ name: PAYMENTS_WEBHOOK_QUEUE })] : []),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, ...(useBullQueue ? [PaymentWebhookProcessor] : [])],
  exports: [PaymentsService],
})
export class PaymentsModule {}
