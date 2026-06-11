import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { UserStatus } from 'src/common/enums/user-status.enum';

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.FROZEN,
    description: '用户状态：1 正常，2 冻结',
  })
  @Type(() => Number)
  @IsEnum(UserStatus, { message: '用户状态不正确' })
  status!: UserStatus;
}
