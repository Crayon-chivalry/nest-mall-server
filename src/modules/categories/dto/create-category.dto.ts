import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: '手机数码', description: '分类名称' })
  @IsString()
  @Length(2, 50)
  name!: string;

  @ApiPropertyOptional({
    example: '手机及周边商品',
    description: '分类描述',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @ApiPropertyOptional({ example: true, description: '是否显示' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
