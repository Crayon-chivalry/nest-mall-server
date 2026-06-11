import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { UserStatus } from 'src/common/enums/user-status.enum';

export class QueryUsersDto {
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

  @ApiPropertyOptional({ example: '13900139000', description: '按手机号筛选' })
  @IsOptional()
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ example: '张', description: '按昵称模糊搜索' })
  @IsOptional()
  @IsString({ message: '昵称关键字必须为字符串' })
  nickname?: string;

  @ApiPropertyOptional({
    enum: UserStatus,
    example: UserStatus.NORMAL,
    description: '按状态筛选：1 正常，2 冻结',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(UserStatus, { message: '用户状态不正确' })
  status?: UserStatus;
}
