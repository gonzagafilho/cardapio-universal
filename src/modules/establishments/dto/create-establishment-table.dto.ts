import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateEstablishmentTableDto {
  @ApiProperty({ description: 'Nome da mesa/comanda (ex.: Mesa 01, Comanda A)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Número/identificador (opcional)' })
  @IsOptional()
  @IsString()
  number?: string;
}

