import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: 1, description: '商品 ID' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiProperty({ example: 1, description: '规格 SKU ID' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  skuId!: number;

  @ApiProperty({ example: 2, description: '购买数量' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}
