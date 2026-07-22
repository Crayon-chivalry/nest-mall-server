import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { QueryCategoriesDto } from './dto/query-categories.dto';

@ApiTags('AppCategories')
@Controller('app/categories')
export class AppCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: '获取前台分类列表' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, example: 10, description: '每页条数' })
  @ApiQuery({ name: 'keyword', required: false, example: '手机', description: '分类名称关键字' })
  @ApiQuery({ name: 'parentId', required: false, example: 1, description: '父级分类 ID' })
  @ApiQuery({ name: 'tree', required: false, example: true, description: '是否返回树形结构' })
  @Get()
  findAll(@Query() queryDto: QueryCategoriesDto) {
    return this.categoriesService.findAll({
      ...queryDto,
      isVisible: true,
      tree: queryDto.tree ?? true,
    });
  }

  @ApiOperation({ summary: '获取前台一级分类列表' })
  @Get('parent/list')
  findParentList() {
    return this.categoriesService.findParentList();
  }

  @ApiOperation({ summary: '获取前台分类详情' })
  @ApiParam({ name: 'id', description: '分类 ID', example: 1 })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
}
