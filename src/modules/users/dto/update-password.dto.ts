import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: '123456', description: '原密码' })
  @IsString({ message: '原密码必须为字符串' })
  @Length(6, 20, { message: '原密码长度必须在 6 到 20 个字符之间' })
  oldPassword!: string;

  @ApiProperty({ example: '123456', description: '新密码' })
  @IsString({ message: '新密码必须为字符串' })
  @Length(6, 20, { message: '新密码长度必须在 6 到 20 个字符之间' })
  newPassword!: string;
}
