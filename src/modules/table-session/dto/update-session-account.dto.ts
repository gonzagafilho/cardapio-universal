import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateSessionAccountDto {
  @ApiPropertyOptional({ description: 'Taxa de serviço (valor absoluto, >= 0)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceFeeAmount?: number;

  @ApiPropertyOptional({ description: 'Desconto (valor absoluto, >= 0)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;
}
