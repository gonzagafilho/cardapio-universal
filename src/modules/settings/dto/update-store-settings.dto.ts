import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStoreSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptsDelivery?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptsPickup?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptsDineIn?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pixKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minimumOrder?: number;

  @ApiPropertyOptional({ description: 'Pedido mínimo somente para entrega (R$)' })
  @IsOptional()
  @IsNumber()
  minimumOrderDelivery?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deliveryEstimate?: number;
}
