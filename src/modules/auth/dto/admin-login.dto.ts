import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class AdminLoginDto {
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

  @ApiProperty({ example: '123456', description: '登录密码' })
  @IsString({ message: '密码必须为字符串' })
  @Length(6, 20, { message: '密码长度必须在 6 到 20 个字符之间' })
  password!: string;
}
