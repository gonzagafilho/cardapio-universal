import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpsertPublicCartItemDto {
  @ApiProperty({ description: 'Session ID anônimo do cliente' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'ID do produto' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantidade' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Observação do item' })
  @IsOptional()
  @IsString()
  notes?: string;
}