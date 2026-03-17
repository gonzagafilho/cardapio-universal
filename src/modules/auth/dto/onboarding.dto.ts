import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class OnboardingDto {
  @ApiProperty({ description: 'Nome da empresa/tenant' })
  @IsString()
  @MinLength(2)
  companyName: string;

  @ApiProperty({ description: 'Slug único da empresa (URL); será normalizado (minúsculas, hífens)' })
  @IsString()
  @MinLength(2)
  companySlug: string;

  @ApiProperty({ description: 'Nome do responsável' })
  @IsString()
  @MinLength(2)
  ownerName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Nome do estabelecimento/loja' })
  @IsString()
  @MinLength(2)
  storeName: string;

  @ApiPropertyOptional({ description: 'Slug do cardápio público (default: derivado do nome)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  storeSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storeDescription?: string;

  @ApiPropertyOptional({ description: 'Plano escolhido no cadastro (basic, pro, enterprise). Default: basic.' })
  @IsOptional()
  @IsString()
  @IsIn(['basic', 'pro', 'enterprise'], { message: 'Plano deve ser basic, pro ou enterprise' })
  plan?: string;
}
