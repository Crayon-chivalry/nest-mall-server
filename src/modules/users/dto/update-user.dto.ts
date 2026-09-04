import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';
import { UserStatus } from 'src/common/enums/user-status.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '13900139000', description: '手机号' })
  @IsOptional()
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'admin01',
    description: '管理员账号，支持字母、数字和下划线',
  })
  @IsOptional()
  @IsString({ message: '管理员账号必须为字符串' })
  @Length(3, 20, { message: '管理员账号长度必须在 3 到 20 个字符之间' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '管理员账号只能包含字母、数字和下划线',
  })
  account?: string;

  @ApiPropertyOptional({ example: '李四', description: '昵称' })
  @IsOptional()
  @IsString({ message: '昵称必须为字符串' })
  @Length(2, 30, { message: '昵称长度必须在 2 到 30 个字符之间' })
  nickname?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/images/new-avatar.jpg',
    description: '头像地址，请先上传图片后再回填返回的 url',
  })
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: '头像地址格式不正确' })
  avatar?: string;

  @ApiPropertyOptional({
    enum: UserStatus,
    example: UserStatus.NORMAL,
    description: '用户状态：1 正常，2 冻结',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(UserStatus, { message: '用户状态不正确' })
  status?: UserStatus;

  @ApiPropertyOptional({ example: '123456', description: '登录密码' })
  @IsOptional()
  @IsString({ message: '登录密码必须为字符串' })
  @Length(6, 20, { message: '登录密码长度必须在 6 到 20 个字符之间' })
  password?: string;
}
