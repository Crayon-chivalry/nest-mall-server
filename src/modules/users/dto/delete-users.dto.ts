import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class DeleteUsersDto {
  @ApiProperty({
    example: ['U1713259000123', 'U1713259000456'],
    description: '用户业务编号列表',
    type: [String],
  })
  @IsArray({ message: '用户编号列表必须为数组' })
  @ArrayNotEmpty({ message: '用户编号列表不能为空' })
  @IsString({ each: true, message: '用户编号必须为字符串' })
  userIds!: string[];
}
