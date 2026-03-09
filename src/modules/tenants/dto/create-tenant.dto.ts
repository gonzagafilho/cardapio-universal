import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Slug único para URL' })
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiPropertyOptional({ default: 'basic', enum: ['basic', 'pro', 'enterprise'] })
  @IsOptional()
  @IsIn(['basic', 'pro', 'enterprise'])
  plan?: string;

  @ApiPropertyOptional({ default: 'active', enum: ['active', 'suspended', 'cancelled'] })
  @IsOptional()
  @IsIn(['active', 'suspended', 'cancelled'])
  status?: string;
}
