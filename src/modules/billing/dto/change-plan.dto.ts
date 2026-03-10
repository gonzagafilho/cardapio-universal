import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class ChangePlanDto {
  @ApiProperty({ enum: ['basic', 'pro', 'enterprise'] })
  @IsIn(['basic', 'pro', 'enterprise'])
  plan: string;
}
