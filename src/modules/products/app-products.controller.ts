import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';

@ApiTags('AppProducts')
@Controller('app/products')
export class AppProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: '分页获取前台上架商品列表' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, example: 10, description: '每页条数' })
  @ApiQuery({ name: 'keyword', required: false, example: 'iPhone', description: '商品名称关键字' })
  @ApiQuery({ name: 'parentCategoryId', required: false, example: 1, description: '一级分类 ID' })
  @ApiQuery({ name: 'categoryId', required: false, example: 2, description: '二级分类 ID' })
  @Get()
  findAll(@Query() queryDto: QueryProductsDto) {
    return this.productsService.findAll({
      ...queryDto,
      isOnSale: true,
    });
  }

  @ApiOperation({ summary: '获取前台商品详情' })
  @ApiParam({ name: 'id', description: '商品 ID', example: 1 })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
}
