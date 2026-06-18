import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateUserPayPasswordDto {
  @ApiProperty({ example: '123456', description: '支付密码' })
  @IsString({ message: '支付密码必须为字符串' })
  @Length(6, 20, {
    message: '支付密码长度必须在 6 到 20 个字符之间',
  })
  payPassword!: string;
}
