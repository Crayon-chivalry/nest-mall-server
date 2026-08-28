import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { OrderStatus } from 'src/common/enums/order-status.enum';

export class QueryOrdersDto {
  @ApiPropertyOptional({ example: 1, description: '页码，默认 1' })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: '每页条数，默认 10，最大 100',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: '订单类型：待付款(pending)、待发货(paid)、待收货(shipped)、已完成(completed)',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @IsOptional()
  @Type(() => String)
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
