import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    example: 'user.manage',
    description: '权限编码，建议模块.动作格式',
  })
  @IsOptional()
  @Matches(/^[a-z][a-z0-9_.:]+$/, {
    message: '权限编码格式不正确',
  })
  code?: string;

  @ApiPropertyOptional({ example: '用户管理', description: '权限名称' })
  @IsOptional()
  @IsString({ message: '权限名称必须为字符串' })
  @Length(2, 100, { message: '权限名称长度必须在 2 到 100 个字符之间' })
  name?: string;

  @ApiPropertyOptional({ example: '用于管理后台用户', description: '权限描述' })
  @IsOptional()
  @IsString({ message: '权限描述必须为字符串' })
  @Length(0, 255, { message: '权限描述长度不能超过 255 个字符' })
  description?: string;

  @ApiPropertyOptional({ example: true, description: '是否启用' })
  @IsOptional()
  @IsBoolean({ message: '是否启用必须为布尔值' })
  isEnabled?: boolean;
}
