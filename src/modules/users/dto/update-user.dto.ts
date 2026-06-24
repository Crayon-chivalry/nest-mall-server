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

  @ApiPropertyOptional({ example: '李四', description: '昵称' })
  @IsOptional()
  @IsString({ message: '昵称必须为字符串' })
  @Length(2, 30, { message: '昵称长度必须在 2 到 30 个字符之间' })
  nickname?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/images/new-avatar.jpg',
    description: '头像地址，请先调用公共图片上传接口，再回填返回的 url',
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

  @ApiPropertyOptional({ example: '123456', description: '支付密码' })
  @IsOptional()
  @IsString({ message: '支付密码必须为字符串' })
  @Length(6, 20, { message: '支付密码长度必须在 6 到 20 个字符之间' })
  payPassword?: string;
}
