import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';

export class UpdateUserProfileDto {
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
}
