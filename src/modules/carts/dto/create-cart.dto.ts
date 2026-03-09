import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({ description: 'ID do estabelecimento' })
  @IsString()
  establishmentId: string;

  @ApiPropertyOptional({ description: 'ID do cliente se logado' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Session ID para carrinho anônimo' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
