import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class AssignUserRolesDto {
  @ApiProperty({
    example: [1, 2],
    description: '管理员角色 ID 列表',
    type: [Number],
  })
  @IsArray({ message: '角色 ID 列表必须为数组' })
  roleIds!: number[];
}
