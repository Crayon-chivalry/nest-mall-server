import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class PromoSectionImageItemDto {
  @ApiPropertyOptional({ example: '每日疯抢', description: '图片标题，可选' })
  @IsOptional()
  @IsString({ message: '图片标题必须为字符串' })
  @Length(0, 100, { message: '图片标题长度不能超过 100 个字符' })
  title?: string;

  @ApiProperty({
    example: 'http://localhost:3000/uploads/images/promo-1.jpg',
    description: '图片地址',
  })
  @IsString({ message: '图片地址必须为字符串' })
  @IsUrl({ require_tld: false }, { message: '图片地址格式不正确' })
  imageUrl!: string;

  @ApiPropertyOptional({
    example: '/pages/activity/detail?id=1',
    description: '点击跳转链接',
  })
  @IsOptional()
  @IsString({ message: '跳转链接必须为字符串' })
  @Length(0, 255, { message: '跳转链接长度不能超过 255 个字符' })
  linkUrl?: string;
}
