import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15', description: '商品名称' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ example: '5999.00', description: '商品价格' })
  @IsNumberString()
  price!: string;

  @ApiProperty({ example: 100, description: '商品库存' })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: 2, description: '二级分类 ID' })
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/images/product-cover.jpg',
    description: '商品封面图，请先调用公共图片上传接口，再回填返回的 url',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  cover?: string;

  @ApiPropertyOptional({ example: '新品手机', description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, description: '是否上架' })
  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean;
}
