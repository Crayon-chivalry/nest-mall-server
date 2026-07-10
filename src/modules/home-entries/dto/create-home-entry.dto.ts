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

export class CreateHomeEntryDto {
  @ApiProperty({ example: '签到中心', description: '金刚区入口标题' })
  @IsString({ message: '入口标题必须为字符串' })
  @Length(2, 100, { message: '入口标题长度必须在 2 到 100 个字符之间' })
  title!: string;

  @ApiProperty({
    example: 'http://localhost:3000/uploads/images/checkin.png',
    description: '入口图标地址',
  })
  @IsString({ message: '入口图标地址必须为字符串' })
  @IsUrl({ require_tld: false }, { message: '入口图标地址格式不正确' })
  iconUrl!: string;

  @ApiPropertyOptional({
    example: '/pages/checkin/index',
    description: '点击跳转链接',
  })
  @IsOptional()
  @IsString({ message: '跳转链接必须为字符串' })
  @Length(0, 255, { message: '跳转链接长度不能超过 255 个字符' })
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
