import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty({ example: '123456', description: '新密码' })
  @IsString({ message: '密码必须为字符串' })
  @Length(6, 20, { message: '密码长度必须在 6 到 20 个字符之间' })
  password!: string;
}
