import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class DeletePromoSectionsDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: '首页广告位 ID 列表',
    type: [Number],
  })
  @IsArray({ message: '首页广告位 ID 列表必须为数组' })
  @ArrayNotEmpty({ message: '首页广告位 ID 列表不能为空' })
  @IsInt({ each: true, message: '首页广告位 ID 必须为整数' })
  ids!: number[];
}
