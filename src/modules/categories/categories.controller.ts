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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: '创建商品分类' })
  @ApiBody({ type: CreateCategoryDto })
  @OperationLog({ module: '分类管理', action: '创建分类' })
  @SuccessMessage('创建成功')
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiOperation({ summary: '获取分类列表' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, example: 10, description: '每页条数' })
  @ApiQuery({ name: 'keyword', required: false, example: '手机', description: '分类名称关键字' })
  @ApiQuery({ name: 'parentId', required: false, example: 1, description: '父级分类 ID' })
  @ApiQuery({ name: 'isVisible', required: false, example: true, description: '是否可见' })
  @ApiQuery({ name: 'tree', required: false, example: true, description: '是否返回树形结构' })
  @Get()
  findAll(@Query() queryDto: QueryCategoriesDto) {
    return this.categoriesService.findAll(queryDto);
  }

  @ApiOperation({ summary: '获取一级分类列表' })
  @Get('parent/list')
  findParentList() {
    return this.categoriesService.findParentList();
  }

  @ApiOperation({ summary: '获取分类详情' })
  @ApiParam({ name: 'id', description: '分类 ID', example: 1 })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @ApiOperation({ summary: '修改商品分类' })
  @ApiParam({ name: 'id', description: '分类 ID', example: 1 })
  @ApiBody({ type: UpdateCategoryDto })
  @OperationLog({ module: '分类管理', action: '修改分类' })
  @SuccessMessage('修改成功')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @ApiOperation({ summary: '删除商品分类' })
  @ApiParam({ name: 'id', description: '分类 ID', example: 1 })
  @OperationLog({
    module: '分类管理',
    action: '删除分类',
    type: OperationLogType.DANGEROUS,
  })
  @SuccessMessage('删除成功')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
