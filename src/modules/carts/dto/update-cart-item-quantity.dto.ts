import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemQuantityDto {
  @ApiProperty({ example: 3, description: '购买数量' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}
