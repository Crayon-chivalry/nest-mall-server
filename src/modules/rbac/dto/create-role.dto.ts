import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'super_admin', description: '角色编码' })
  @Matches(/^[a-z][a-z0-9_]+$/, {
    message: '角色编码格式不正确',
  })
  code!: string;

  @ApiProperty({ example: '超级管理员', description: '角色名称' })
  @IsString({ message: '角色名称必须为字符串' })
  @Length(2, 100, { message: '角色名称长度必须在 2 到 100 个字符之间' })
  name!: string;

  @ApiPropertyOptional({ example: '拥有全部后台权限', description: '角色描述' })
  @IsOptional()
  @IsString({ message: '角色描述必须为字符串' })
  @Length(0, 255, { message: '角色描述长度不能超过 255 个字符' })
  description?: string;

  @ApiPropertyOptional({ example: true, description: '是否启用' })
  @IsOptional()
  @IsBoolean({ message: '是否启用必须为布尔值' })
  isEnabled?: boolean;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: '绑定的权限 ID 列表',
    type: [Number],
  })
  @IsOptional()
  @IsArray({ message: '权限 ID 列表必须为数组' })
  permissionIds?: number[];
}
