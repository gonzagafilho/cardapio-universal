import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class CreateSessionPixDto {
  @ApiPropertyOptional({
    description: 'E-mail do pagador (opcional). Usado no Mercado Pago para o PIX.',
  })
  @IsOptional()
  @IsEmail()
  payerEmail?: string;
}

