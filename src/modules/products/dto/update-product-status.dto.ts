import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateProductStatusDto {
  @ApiProperty({ example: true, description: '是否上架' })
  @IsBoolean()
  isOnSale!: boolean;
}
