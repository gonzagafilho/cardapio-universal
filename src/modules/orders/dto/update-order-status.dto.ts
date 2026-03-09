import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
