import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PaymentsService } from './payments.service';

export const PAYMENTS_WEBHOOK_QUEUE = 'payments-webhook';

@Processor(PAYMENTS_WEBHOOK_QUEUE)
export class PaymentWebhookProcessor extends WorkerHost {
  constructor(private readonly paymentsService: PaymentsService) {
    super();
  }

  async process(job: Job<{ provider: string; payload: unknown }>): Promise<void> {
    await this.paymentsService.processMercadoPagoWebhookInternal(
      job.data.provider,
      job.data.payload,
    );
  }
}
