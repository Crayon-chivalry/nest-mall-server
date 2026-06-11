import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAdminOperationLogsDto {
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

  @ApiPropertyOptional({ example: '用户管理', description: '模块筛选' })
  @IsOptional()
  @IsString({ message: '模块必须为字符串' })
  module?: string;

  @ApiPropertyOptional({ example: '修改用户状态', description: '操作筛选' })
  @IsOptional()
  @IsString({ message: '操作必须为字符串' })
  action?: string;

  @ApiPropertyOptional({ example: '13800138000', description: '操作人手机号筛选' })
  @IsOptional()
  @IsString({ message: '操作人手机号必须为字符串' })
  operatorPhone?: string;

  @ApiPropertyOptional({ example: true, description: '是否成功筛选' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: '是否成功必须为布尔值' })
  isSuccess?: boolean;
}
