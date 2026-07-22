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
import { OperationLog } from 'src/common/decorators/operation-log.decorator';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { OperationLogType } from 'src/common/enums/operation-log-type.enum';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { QueryBannersDto } from './dto/query-banners.dto';
import { UpdateBannerStatusDto } from './dto/update-banner-status.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@ApiTags('AdminBanners')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @RequirePermissions('banner.create')
  @OperationLog({ module: '轮播图管理', action: '创建轮播图' })
  @ApiOperation({ summary: '创建轮播图' })
  @ApiBody({ type: CreateBannerDto })
  @SuccessMessage('创建成功')
  @Post()
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @RequirePermissions('banner.view')
  @ApiOperation({ summary: '分页获取轮播图列表' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    example: 10,
    description: '每页条数',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    example: '首页',
    description: '标题关键字',
  })
  @ApiQuery({
    name: 'isEnabled',
    required: false,
    example: true,
    description: '启用状态',
  })
  @Get()
  findAll(@Query() queryDto: QueryBannersDto) {
    return this.bannersService.findAll(queryDto);
  }

  @RequirePermissions('banner.view')
  @ApiOperation({ summary: '获取单个轮播图详情' })
  @ApiParam({ name: 'id', description: '轮播图 ID', example: 1 })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.findOne(id);
  }

  @RequirePermissions('banner.update')
  @OperationLog({ module: '轮播图管理', action: '修改轮播图' })
  @ApiOperation({ summary: '修改轮播图' })
  @ApiParam({ name: 'id', description: '轮播图 ID', example: 1 })
  @ApiBody({ type: UpdateBannerDto })
  @SuccessMessage('修改成功')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
  ) {
    return this.bannersService.update(id, updateBannerDto);
  }

  @RequirePermissions('banner.status.update')
  @OperationLog({
    module: '轮播图管理',
    action: '修改轮播图状态',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '修改轮播图状态' })
  @ApiParam({ name: 'id', description: '轮播图 ID', example: 1 })
  @ApiBody({ type: UpdateBannerStatusDto })
  @SuccessMessage('修改成功')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerStatusDto: UpdateBannerStatusDto,
  ) {
    return this.bannersService.updateStatus(id, updateBannerStatusDto);
  }

  @RequirePermissions('banner.delete')
  @OperationLog({
    module: '轮播图管理',
    action: '删除轮播图',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '删除轮播图' })
  @ApiParam({ name: 'id', description: '轮播图 ID', example: 1 })
  @SuccessMessage('删除成功')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.remove(id);
  }
}
