import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class DeleteRolesDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: '角色 ID 列表',
    type: [Number],
  })
  @IsArray({ message: '角色 ID 列表必须为数组' })
  @ArrayNotEmpty({ message: '角色 ID 列表不能为空' })
  @IsInt({ each: true, message: '角色 ID 必须为整数' })
  ids!: number[];
}
