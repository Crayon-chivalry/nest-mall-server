import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '13800138000', description: '登录手机号' })
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone!: string;

  @ApiProperty({ example: '123456', description: '登录密码' })
  @IsString({ message: '密码必须为字符串' })
  @Length(6, 20, { message: '密码长度必须在 6 到 20 个字符之间' })
  password!: string;
}
