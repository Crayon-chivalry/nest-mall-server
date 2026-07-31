import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';
import { CartsService } from './carts.service';

@ApiTags('AppCarts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('app/carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiOperation({ summary: '获取当前用户购物车' })
  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.cartsService.findAll(user.id);
  }

  @ApiOperation({ summary: '加入购物车' })
  @ApiBody({ type: AddCartItemDto })
  @SuccessMessage('加入成功')
  @Post('items')
  addItem(@CurrentUser() user: RequestUser, @Body() addCartItemDto: AddCartItemDto) {
    return this.cartsService.addItem(user.id, addCartItemDto);
  }

  @ApiOperation({ summary: '修改购物车商品数量' })
  @ApiParam({ name: 'itemId', description: '购物车项 ID', example: 1 })
  @ApiBody({ type: UpdateCartItemQuantityDto })
  @SuccessMessage('修改成功')
  @Patch('items/:itemId')
  updateQuantity(
    @CurrentUser() user: RequestUser,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemQuantityDto: UpdateCartItemQuantityDto,
  ) {
    return this.cartsService.updateQuantity(
      user.id,
      itemId,
      updateCartItemQuantityDto,
    );
  }

  @ApiOperation({ summary: '删除购物车商品' })
  @ApiParam({ name: 'itemId', description: '购物车项 ID', example: 1 })
  @SuccessMessage('删除成功')
  @Delete('items/:itemId')
  removeItem(
    @CurrentUser() user: RequestUser,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.cartsService.removeItem(user.id, itemId);
  }

  @ApiOperation({ summary: '清空购物车' })
  @SuccessMessage('清空成功')
  @Delete()
  clear(@CurrentUser() user: RequestUser) {
    return this.cartsService.clear(user.id);
  }
}
