import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PaymentType } from 'src/common/enums/payment-type.enum';

export class PayOrderDto {
  @ApiProperty({
    enum: PaymentType,
    example: PaymentType.ALIPAY,
    description: '支付方式：`alipay` 表示支付宝，`wechat` 表示微信支付',
  })
  @IsEnum(PaymentType)
  paymentType!: PaymentType;
}
