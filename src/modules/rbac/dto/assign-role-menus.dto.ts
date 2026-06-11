import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class AssignRoleMenusDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: '菜单 ID 列表',
    type: [Number],
  })
  @IsArray({ message: '菜单 ID 列表必须为数组' })
  menuIds!: number[];
}
