import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserStatus } from 'src/common/enums/user-status.enum';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    example: 'admin01',
    description: '管理员账号，支持字母、数字和下划线',
  })
  @IsString({ message: '管理员账号必须为字符串' })
  @Length(3, 20, { message: '管理员账号长度必须在 3 到 20 个字符之间' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '管理员账号只能包含字母、数字和下划线',
  })
  account!: string;

  @ApiProperty({ example: 'admin123', description: '管理员登录密码' })
  @IsString({ message: '密码必须为字符串' })
  @Length(6, 20, { message: '密码长度必须在 6 到 20 个字符之间' })
  password!: string;

  @ApiProperty({ example: '系统管理员', description: '管理员昵称' })
  @IsString({ message: '昵称必须为字符串' })
  @Length(2, 30, { message: '昵称长度必须在 2 到 30 个字符之间' })
  nickname!: string;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/images/admin-avatar.jpg',
    description: '管理员头像地址，请先上传图片后再回填 url',
  })
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: '头像地址格式不正确' })
  avatar?: string;

  @ApiPropertyOptional({
    enum: UserStatus,
    example: UserStatus.NORMAL,
    description: '管理员状态：1 正常，2 冻结',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(UserStatus, { message: '管理员状态不正确' })
  status?: UserStatus;
}
