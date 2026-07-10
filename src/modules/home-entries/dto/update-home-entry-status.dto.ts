import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateHomeEntryStatusDto {
  @ApiProperty({ example: true, description: '是否启用' })
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
  isEnabled!: boolean;
}
