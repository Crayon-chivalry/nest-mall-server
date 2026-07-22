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
import { CreateHomeEntryDto } from './dto/create-home-entry.dto';
import { DeleteHomeEntriesDto } from './dto/delete-home-entries.dto';
import { QueryHomeEntriesDto } from './dto/query-home-entries.dto';
import { UpdateHomeEntryStatusDto } from './dto/update-home-entry-status.dto';
import { UpdateHomeEntryDto } from './dto/update-home-entry.dto';
import { HomeEntriesService } from './home-entries.service';

@ApiTags('AdminHomeEntries')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/home-entries')
export class HomeEntriesController {
  constructor(private readonly homeEntriesService: HomeEntriesService) {}

  @RequirePermissions('home.entry.create')
  @OperationLog({ module: '金刚区入口管理', action: '创建金刚区入口' })
  @ApiOperation({ summary: '创建金刚区入口' })
  @ApiBody({ type: CreateHomeEntryDto })
  @SuccessMessage('创建成功')
  @Post()
  create(@Body() createHomeEntryDto: CreateHomeEntryDto) {
    return this.homeEntriesService.create(createHomeEntryDto);
  }

  @RequirePermissions('home.entry.view')
  @ApiOperation({ summary: '分页获取金刚区入口列表' })
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
    example: '签到',
    description: '标题关键字',
  })
  @ApiQuery({
    name: 'isEnabled',
    required: false,
    example: true,
    description: '启用状态',
  })
  @Get()
  findAll(@Query() queryDto: QueryHomeEntriesDto) {
    return this.homeEntriesService.findAll(queryDto);
  }

  @RequirePermissions('home.entry.view')
  @ApiOperation({ summary: '获取单个金刚区入口详情' })
  @ApiParam({ name: 'id', description: '金刚区入口 ID', example: 1 })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.homeEntriesService.findOne(id);
  }

  @RequirePermissions('home.entry.update')
  @OperationLog({ module: '金刚区入口管理', action: '修改金刚区入口' })
  @ApiOperation({ summary: '修改金刚区入口' })
  @ApiParam({ name: 'id', description: '金刚区入口 ID', example: 1 })
  @ApiBody({ type: UpdateHomeEntryDto })
  @SuccessMessage('修改成功')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeEntryDto: UpdateHomeEntryDto,
  ) {
    return this.homeEntriesService.update(id, updateHomeEntryDto);
  }

  @RequirePermissions('home.entry.status.update')
  @OperationLog({
    module: '金刚区入口管理',
    action: '修改金刚区入口状态',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '修改金刚区入口状态' })
  @ApiParam({ name: 'id', description: '金刚区入口 ID', example: 1 })
  @ApiBody({ type: UpdateHomeEntryStatusDto })
  @SuccessMessage('修改成功')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeEntryStatusDto: UpdateHomeEntryStatusDto,
  ) {
    return this.homeEntriesService.updateStatus(id, updateHomeEntryStatusDto);
  }

  @RequirePermissions('home.entry.delete')
  @OperationLog({
    module: '金刚区入口管理',
    action: '批量删除金刚区入口',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '批量删除金刚区入口' })
  @ApiBody({ type: DeleteHomeEntriesDto })
  @SuccessMessage('删除成功')
  @Delete()
  remove(@Body() deleteHomeEntriesDto: DeleteHomeEntriesDto) {
    return this.homeEntriesService.remove(deleteHomeEntriesDto);
  }
}
