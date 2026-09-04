import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrdersService } from './orders.service';

@ApiTags('AppOrders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('app/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: '分页获取当前用户订单列表，可按状态过滤' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码，默认 1' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    example: 10,
    description: '每页条数，默认 10，最大 100',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    description: '订单类型：待付款(pending)、待发货(paid)、待收货(shipped)、已完成(completed)',
  })
  @Get()
  findAll(@CurrentUser() user: RequestUser, @Query() queryDto: QueryOrdersDto) {
    return this.ordersService.findAll(user.id, queryDto);
  }

  @ApiOperation({ summary: '获取订单数徽标（待付款、待发货、待收货）' })
  @Get('badges')
  findBadges(@CurrentUser() user: RequestUser) {
    return this.ordersService.findBadges(user.id);
  }

  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'id', description: '订单 ID', example: 1 })
  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(user.id, id);
  }

  @ApiOperation({ summary: '提交订单' })
  @ApiBody({ type: CreateOrderDto })
  @SuccessMessage('提交成功')
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user.id, createOrderDto);
  }

  @ApiOperation({ summary: '订单支付，练习项目直接模拟支付成功' })
  @ApiParam({ name: 'id', description: '订单 ID', example: 1 })
  @ApiBody({ type: PayOrderDto })
  @SuccessMessage('支付成功')
  @Post(':id/pay')
  pay(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() payOrderDto: PayOrderDto,
  ) {
    return this.ordersService.pay(user.id, id, payOrderDto);
  }
}
