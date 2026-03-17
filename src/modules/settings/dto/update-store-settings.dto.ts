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
  @IsBoolean()
  paymentPix?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  paymentCardOnDelivery?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  paymentCardOnCounter?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()

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
