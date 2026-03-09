import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectedOptionDto {
  @ApiProperty()
  @IsString()
  groupId: string;

  @ApiProperty()
  @IsString()
  itemId: string;
}

export class AddCartItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [SelectedOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedOptionDto)
  options?: SelectedOptionDto[];
}
