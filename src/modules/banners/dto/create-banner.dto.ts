import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ example: '首页大促轮播图', description: '轮播图标题' })
  @IsString({ message: '轮播图标题必须为字符串' })
  @Length(2, 100, { message: '轮播图标题长度必须在 2 到 100 个字符之间' })
  title!: string;

  @ApiProperty({
    example: 'http://localhost:3000/uploads/images/banner-1.jpg',
    description: '轮播图图片地址，请先调用公共图片上传接口，再回填返回的 url',
  })
  @IsString({ message: '轮播图图片地址必须为字符串' })
  @IsUrl({ require_tld: false }, { message: '轮播图图片地址格式不正确' })
  imageUrl!: string;

  @ApiPropertyOptional({
    example: 'https://mall.example.com/activity/spring-sale',
    description: '点击跳转链接',
  })
  @IsOptional()
  @IsString({ message: '跳转链接必须为字符串' })
  @IsUrl({ require_tld: false }, { message: '跳转链接格式不正确' })
  linkUrl?: string;

  @ApiPropertyOptional({ example: 1, description: '排序值，越小越靠前' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '排序值必须为整数' })
  @Min(0, { message: '排序值不能小于 0' })
  sort?: number;

  @ApiPropertyOptional({ example: true, description: '是否启用' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) {
      return true;
    }

    if (value === 'false' || value === false) {
      return false;
    }

    return value;
  })
  @IsBoolean({ message: '是否启用必须为布尔值' })
  isEnabled?: boolean;
}
