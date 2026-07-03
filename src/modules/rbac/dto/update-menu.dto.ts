import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { MenuType } from 'src/common/enums/menu-type.enum';

export class UpdateMenuDto {
  @ApiPropertyOptional({ example: '用户管理', description: '菜单名称' })
  @IsOptional()
  @IsString({ message: '菜单名称必须为字符串' })
  @Length(2, 100, { message: '菜单名称长度必须在 2 到 100 个字符之间' })
  name?: string;

  @ApiPropertyOptional({ example: 'system_user', description: '菜单编码' })
  @IsOptional()
  @Matches(/^[a-z][a-z0-9_]+$/, { message: '菜单编码格式不正确' })
  code?: string;

  @ApiPropertyOptional({
    enum: MenuType,
    example: MenuType.MENU,
    description: '菜单类型：1 目录，2 菜单，3 操作项',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MenuType, { message: '菜单类型不正确' })
  type?: MenuType;

  @ApiPropertyOptional({
    example: null,
    description: '父级菜单 ID，顶级菜单传 null',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '父级菜单 ID 必须为整数' })
  @Min(1, { message: '父级菜单 ID 必须大于 0' })
  parentId?: number | null;

  @ApiPropertyOptional({ example: '/system/user', description: '前端路由路径' })
  @IsOptional()
  @IsString({ message: '路由路径必须为字符串' })
  @Length(0, 255, { message: '路由路径长度不能超过 255 个字符' })
  path?: string;

  @ApiPropertyOptional({
    example: 'system/user/index',
    description: '前端组件路径',
  })
  @IsOptional()
  @IsString({ message: '组件路径必须为字符串' })
  @Length(0, 255, { message: '组件路径长度不能超过 255 个字符' })
  component?: string;

  @ApiPropertyOptional({ example: 'UserFilled', description: '菜单图标' })
  @IsOptional()
  @IsString({ message: '菜单图标必须为字符串' })
  @Length(0, 100, { message: '菜单图标长度不能超过 100 个字符' })
  icon?: string;

  @ApiPropertyOptional({
    example: 'user.view',
    description: '菜单关联的权限码',
  })
  @IsOptional()
  @IsString({ message: '权限码必须为字符串' })
  @Length(0, 100, { message: '权限码长度不能超过 100 个字符' })
  permissionCode?: string;

  @ApiPropertyOptional({ example: 1, description: '排序值' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能小于 0' })
  sort?: number;

  @ApiPropertyOptional({ example: true, description: '是否显示' })
  @IsOptional()
  @IsBoolean({ message: '是否显示必须为布尔值' })
  isVisible?: boolean;

  @ApiPropertyOptional({ example: true, description: '是否启用' })
  @IsOptional()
  @IsBoolean({ message: '是否启用必须为布尔值' })
  isEnabled?: boolean;
}
