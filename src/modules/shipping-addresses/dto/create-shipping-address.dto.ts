import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateShippingAddressDto {
  @ApiProperty({ example: '张三', description: '收货人姓名' })
  @IsString({ message: '收货人姓名必须为字符串' })
  @Length(2, 20, { message: '收货人姓名长度必须在 2 到 20 个字符之间' })
  receiverName!: string;

  @ApiProperty({ example: '13800138000', description: '收货人手机号' })
  @Matches(/^1\d{10}$/, { message: '收货人手机号格式不正确' })
  receiverPhone!: string;

  @ApiProperty({ example: '广东省', description: '省份' })
  @IsString({ message: '省份必须为字符串' })
  @Length(1, 50, { message: '省份长度必须在 1 到 50 个字符之间' })
  province!: string;

  @ApiProperty({ example: '深圳市', description: '城市' })
  @IsString({ message: '城市必须为字符串' })
  @Length(1, 50, { message: '城市长度必须在 1 到 50 个字符之间' })
  city!: string;

  @ApiProperty({ example: '南山区', description: '区县' })
  @IsString({ message: '区县必须为字符串' })
  @Length(1, 50, { message: '区县长度必须在 1 到 50 个字符之间' })
  district!: string;

  @ApiProperty({ example: '科技园科苑路 15 号 1201 室', description: '详细地址' })
  @IsString({ message: '详细地址必须为字符串' })
  @Length(5, 255, { message: '详细地址长度必须在 5 到 255 个字符之间' })
  detailAddress!: string;

  @ApiPropertyOptional({ example: '518000', description: '邮政编码' })
  @IsOptional()
  @Matches(/^\d{6}$/, { message: '邮政编码格式不正确' })
  postalCode?: string;

  @ApiPropertyOptional({ example: true, description: '是否设为默认地址' })
  @IsOptional()
  @IsBoolean({ message: '是否默认地址必须为布尔值' })
  isDefault?: boolean;

  @ApiPropertyOptional({ example: '家', description: '地址标签' })
  @IsOptional()
  @IsString({ message: '地址标签必须为字符串' })
  @Length(1, 50, { message: '地址标签长度必须在 1 到 50 个字符之间' })
  addressTag?: string;
}
