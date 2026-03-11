import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class CheckoutSubscriptionDto {
  @ApiProperty({ enum: ['basic', 'pro', 'enterprise'] })
  @IsIn(['basic', 'pro', 'enterprise'])
  plan: string;
}
