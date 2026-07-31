import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductSkuSpecDto } from './product-sku-spec.dto';

export class ProductSkuDto {
  @ApiProperty({ example: '500g / 红色', description: 'SKU 名称' })
  @IsString()
  @Length(1, 100)
  title!: string;

  @ApiProperty({
    type: [ProductSkuSpecDto],
    example: [{ name: '容量', value: '500g' }],
    description: 'SKU 规格项',
  })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ProductSkuSpecDto)
  specs!: ProductSkuSpecDto[];

  @ApiProperty({ example: '29.90', description: 'SKU 售价' })
  @IsNumberString()
  price!: string;

  @ApiProperty({ example: 100, description: 'SKU 库存' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/images/product-sku-cover.jpg',
    description: 'SKU 封面图',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  cover?: string;

  @ApiPropertyOptional({ example: true, description: '是否默认展示 SKU' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
