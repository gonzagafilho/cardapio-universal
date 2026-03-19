import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID do estabelecimento' })
  @IsString()
  establishmentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ enum: ['delivery', 'pickup', 'dine_in'] })
  @IsIn(['delivery', 'pickup', 'dine_in'])
  type: string;

  @ApiProperty({ description: 'ID do carrinho' })
  @IsString()
  cartId: string;

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

  @ApiPropertyOptional({ description: 'Token da mesa/comanda (fallback para consumo no local)' })
  @IsOptional()
  @IsString()
  tableToken?: string;
}
