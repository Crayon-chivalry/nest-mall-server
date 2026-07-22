import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartsService } from './carts.service';

@ApiTags('AppCarts')
@Controller('app/carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiOperation({ summary: '获取购物车列表' })
  @Get()
  findAll() {
    return this.cartsService.findAll();
  }
}
