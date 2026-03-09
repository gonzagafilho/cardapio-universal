import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderProductItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  sortOrder: number;
}

export class ReorderProductsDto {
  @ApiProperty({ type: [ReorderProductItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderProductItemDto)
  items: ReorderProductItemDto[];
}
