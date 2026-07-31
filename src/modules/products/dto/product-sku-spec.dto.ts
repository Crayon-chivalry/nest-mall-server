import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ProductSkuSpecDto {
  @ApiProperty({ example: '规格', description: '规格名称，如容量、颜色' })
  @IsString()
  @Length(1, 50)
  name!: string;

  @ApiProperty({ example: '500g', description: '规格值' })
  @IsString()
  @Length(1, 50)
  value!: string;
}
