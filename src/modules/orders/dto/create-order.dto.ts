import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: '收货地址 ID' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  shippingAddressId!: number;

  @ApiPropertyOptional({
    example: [1, 2],
    description: '从购物车提交时传购物车项 ID 列表',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @Type(() => Number)
  @IsInt({ each: true })
  cartItemIds?: number[];

  @ApiPropertyOptional({
    type: [CreateOrderItemDto],
    description: '立即购买时可直接传商品和规格列表',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];

  @ApiPropertyOptional({ example: '周末送达', description: '订单备注' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string;
}
