import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreatePublicOrderDto {
  @ApiProperty({ description: 'Session ID do cliente' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'ID do carrinho' })
  @IsString()
  cartId: string;

  @ApiProperty({ enum: ['delivery', 'pickup', 'dine_in'] })
  @IsIn(['delivery', 'pickup', 'dine_in'])
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional({ description: 'ID da mesa/comanda (consumo no local)' })
  @IsOptional()
  @IsString()
  tableId?: string;
}