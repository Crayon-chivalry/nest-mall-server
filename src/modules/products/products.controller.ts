import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OperationLog } from 'src/common/decorators/operation-log.decorator';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { OperationLogType } from 'src/common/enums/operation-log-type.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: '创建商品' })
  @ApiBody({ type: CreateProductDto })
  @OperationLog({ module: '商品管理', action: '创建商品' })
  @SuccessMessage('创建成功')
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @ApiOperation({ summary: '分页获取商品列表' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, example: 10, description: '每页条数' })
  @ApiQuery({ name: 'keyword', required: false, example: 'iPhone', description: '商品名称关键字' })
  @ApiQuery({ name: 'parentCategoryId', required: false, example: 1, description: '一级分类 ID' })
  @ApiQuery({ name: 'categoryId', required: false, example: 2, description: '二级分类 ID' })
  @ApiQuery({ name: 'isOnSale', required: false, example: true, description: '是否上架' })
  @Get()
  findAll(@Query() queryDto: QueryProductsDto) {
    return this.productsService.findAll(queryDto);
  }

  @ApiOperation({ summary: '获取商品详情' })
  @ApiParam({ name: 'id', description: '商品 ID', example: 1 })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ summary: '修改商品' })
  @ApiParam({ name: 'id', description: '商品 ID', example: 1 })
  @ApiBody({ type: UpdateProductDto })
  @OperationLog({ module: '商品管理', action: '修改商品' })
  @SuccessMessage('修改成功')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @ApiOperation({ summary: '修改商品上架状态' })
  @ApiParam({ name: 'id', description: '商品 ID', example: 1 })
  @ApiBody({ type: UpdateProductStatusDto })
  @OperationLog({
    module: '商品管理',
    action: '修改商品上架状态',
    type: OperationLogType.DANGEROUS,
  })
  @SuccessMessage('修改成功')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductStatusDto: UpdateProductStatusDto,
  ) {
    return this.productsService.updateStatus(id, updateProductStatusDto);
  }

  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', description: '商品 ID', example: 1 })
  @OperationLog({
    module: '商品管理',
    action: '删除商品',
    type: OperationLogType.DANGEROUS,
  })
  @SuccessMessage('删除成功')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
