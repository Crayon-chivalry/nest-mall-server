import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'user.manage',
    description: '权限编码，建议使用 模块.动作 格式',
  })
  @Matches(/^[a-z][a-z0-9_.:]+$/, {
    message: '权限编码格式不正确',
  })
  code!: string;

  @ApiProperty({ example: '用户管理', description: '权限名称' })
  @IsString({ message: '权限名称必须为字符串' })
  @Length(2, 100, { message: '权限名称长度必须在 2 到 100 个字符之间' })
  name!: string;

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
