import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PromoSectionLayout } from 'src/common/enums/promo-section-layout.enum';

export class QueryPromoSectionsDto {
  @ApiPropertyOptional({ example: 1, description: '页码，默认 1' })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: '页码不能小于 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: '每页条数，默认 10，最大 100',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: '每页条数不能小于 1' })
  @Max(100, { message: '每页条数不能大于 100' })
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: '活动专区', description: '按标题模糊搜索' })
  @IsOptional()
  @IsString({ message: '标题关键词必须为字符串' })
  title?: string;

  @ApiPropertyOptional({
    enum: PromoSectionLayout,
    example: PromoSectionLayout.DOUBLE,
    description: '按布局类型筛选',
  })
  @IsOptional()
  @IsEnum(PromoSectionLayout, { message: '布局类型不正确' })
  layoutType?: PromoSectionLayout;

  @ApiPropertyOptional({ example: true, description: '按启用状态筛选' })
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
  @IsBoolean({ message: '启用状态必须为布尔值' })
  isEnabled?: boolean;
}
