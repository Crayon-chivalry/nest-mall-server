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
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { ShippingAddressesService } from './shipping-addresses.service';

@ApiTags('AppShippingAddresses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('app/shipping-addresses')
export class AppShippingAddressesController {
  constructor(
    private readonly shippingAddressesService: ShippingAddressesService,
  ) {}

  @ApiOperation({ summary: '获取当前用户收货地址列表' })
  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.shippingAddressesService.findAll(user.id);
  }

  @ApiOperation({
    summary: '获取当前用户默认收货地址，无默认地址时返回第一条，无地址时返回 null',
  })
  @Get('default')
  findDefault(@CurrentUser() user: RequestUser) {
    return this.shippingAddressesService.findDefault(user.id);
  }

  @ApiOperation({ summary: '获取当前用户收货地址详情' })
  @ApiParam({ name: 'id', description: '收货地址 ID', example: 1 })
  @Get(':id')
  findOne(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.shippingAddressesService.findOne(user.id, id);
  }

  @ApiOperation({ summary: '新增收货地址' })
  @ApiBody({ type: CreateShippingAddressDto })
  @SuccessMessage('新增成功')
  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() createShippingAddressDto: CreateShippingAddressDto,
  ) {
    return this.shippingAddressesService.create(user.id, createShippingAddressDto);
  }

  @ApiOperation({ summary: '修改收货地址' })
  @ApiParam({ name: 'id', description: '收货地址 ID', example: 1 })
  @ApiBody({ type: UpdateShippingAddressDto })
  @SuccessMessage('修改成功')
  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShippingAddressDto: UpdateShippingAddressDto,
  ) {
    return this.shippingAddressesService.update(
      user.id,
      id,
      updateShippingAddressDto,
    );
  }

  @ApiOperation({ summary: '设为默认收货地址' })
  @ApiParam({ name: 'id', description: '收货地址 ID', example: 1 })
  @SuccessMessage('设置成功')
  @Patch(':id/default')
  setDefault(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.shippingAddressesService.setDefault(user.id, id);
  }

  @ApiOperation({ summary: '删除收货地址' })
  @ApiParam({ name: 'id', description: '收货地址 ID', example: 1 })
  @SuccessMessage('删除成功')
  @Delete(':id')
  remove(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.shippingAddressesService.remove(user.id, id);
  }
}
