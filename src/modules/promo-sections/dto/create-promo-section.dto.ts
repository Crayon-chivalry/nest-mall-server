import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { PromoSectionLayout } from 'src/common/enums/promo-section-layout.enum';
import { PromoSectionImageItemDto } from './promo-section-image-item.dto';

export class CreatePromoSectionDto {
  @ApiProperty({ example: '首页活动专区', description: '广告位标题' })
  @IsString({ message: '广告位标题必须为字符串' })
  @Length(2, 100, { message: '广告位标题长度必须在 2 到 100 个字符之间' })
  title!: string;

  @ApiProperty({
    enum: PromoSectionLayout,
    example: PromoSectionLayout.TRIPLE,
    description: '布局类型：single 单图，double 双图，triple 三图',
  })
  @IsEnum(PromoSectionLayout, { message: '布局类型不正确' })
  layoutType!: PromoSectionLayout;

  @ApiProperty({
    type: [PromoSectionImageItemDto],
    description: '图片列表，数量需与布局类型一致',
  })
  @IsArray({ message: '图片列表必须为数组' })
  @ArrayMinSize(1, { message: '图片列表至少需要 1 项' })
  @ArrayMaxSize(3, { message: '图片列表最多只能有 3 项' })
  @ValidateNested({ each: true })
  @Type(() => PromoSectionImageItemDto)
  imageItems!: PromoSectionImageItemDto[];

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
