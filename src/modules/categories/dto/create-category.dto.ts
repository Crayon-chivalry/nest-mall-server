import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: '手机数码', description: '分类名称' })
  @IsString()
  @Length(2, 50)
  name!: string;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/images/category-phone.png',
    description: '分类图标，一级和二级分类都支持',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  icon?: string;

  @ApiPropertyOptional({ example: true, description: '是否显示' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: '父级分类 ID，不传表示创建一级分类',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 0 ||
      value === '0'
    ) {
      return undefined;
    }

    return Number(value);
  })
  @IsInt()
  @Min(1)
  parentId?: number;

  @ApiPropertyOptional({ example: 0, description: '排序值，越小越靠前' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort?: number;
}
