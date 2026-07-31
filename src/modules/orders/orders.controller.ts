import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('AppOrders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('app/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: '获取当前用户订单列表' })
  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.ordersService.findAll(user.id);
  }

  @ApiOperation({ summary: '提交订单' })
  @ApiBody({ type: CreateOrderDto })
  @SuccessMessage('提交成功')
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user.id, createOrderDto);
  }
}
