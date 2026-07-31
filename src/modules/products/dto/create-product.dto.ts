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
  IsUrl,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductSkuDto } from './product-sku.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15', description: '商品名称' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiPropertyOptional({
    example: '5999.00',
    description: '商品默认售价；传了 skus 时可不传，系统会自动取最低规格价',
  })
  @IsOptional()
  @IsNumberString()
  price?: string;

  @ApiPropertyOptional({
    example: 100,
    description: '商品默认库存；传了 skus 时可不传，系统会自动汇总规格库存',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiProperty({ example: 2, description: '二级分类 ID' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/images/product-cover.jpg',
    description: '商品封面图；不传时默认取商品主图第一张',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  cover?: string;

  @ApiProperty({
    type: [String],
    example: [
      'http://localhost:3000/uploads/images/product-1.jpg',
      'http://localhost:3000/uploads/images/product-2.jpg',
    ],
    description: '商品主图列表，详情页顶部轮播使用',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsUrl({ require_tld: false }, { each: true })
  images!: string[];

  @ApiPropertyOptional({ example: '新品手机', description: '商品简介' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '<p><img src="http://localhost:3000/uploads/images/detail-1.jpg" /></p>',
    description: '商品详情介绍，支持富文本 HTML',
  })
  @IsOptional()
  @IsString()
  detailContent?: string;

  @ApiPropertyOptional({ example: true, description: '是否上架' })
  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean;

  @ApiPropertyOptional({
    type: [ProductSkuDto],
    description: '商品规格 SKU 列表，可配置不同规格的价格、库存、封面图',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ProductSkuDto)
  skus?: ProductSkuDto[];
}
