import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateDeliveryZoneDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: ['radius', 'polygon'] })
  @IsIn(['radius', 'polygon'])
  type: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  fee: number;

  @ApiProperty({ description: 'Tempo mínimo em minutos' })
  @IsInt()
  @Min(0)
  minTime: number;

  @ApiProperty({ description: 'Tempo máximo em minutos' })
  @IsInt()
  @Min(0)
  maxTime: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
