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
import { PromoSectionLayout } from 'src/common/enums/promo-section-layout.enum';
import { OperationLogType } from 'src/common/enums/operation-log-type.enum';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePromoSectionDto } from './dto/create-promo-section.dto';
import { QueryPromoSectionsDto } from './dto/query-promo-sections.dto';
import { UpdatePromoSectionStatusDto } from './dto/update-promo-section-status.dto';
import { UpdatePromoSectionDto } from './dto/update-promo-section.dto';
import { PromoSectionsService } from './promo-sections.service';

@ApiTags('AdminPromoSections')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/promo-sections')
export class PromoSectionsController {
  constructor(private readonly promoSectionsService: PromoSectionsService) {}

  @RequirePermissions('promo.section.create')
  @OperationLog({ module: '首页广告位管理', action: '创建首页广告位' })
  @ApiOperation({ summary: '创建首页广告位' })
  @ApiBody({ type: CreatePromoSectionDto })
  @SuccessMessage('创建成功')
  @Post()
  create(@Body() createPromoSectionDto: CreatePromoSectionDto) {
    return this.promoSectionsService.create(createPromoSectionDto);
  }

  @RequirePermissions('promo.section.view')
  @ApiOperation({ summary: '分页获取首页广告位列表' })
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
    example: '活动专区',
    description: '标题关键词',
  })
  @ApiQuery({
    name: 'layoutType',
    required: false,
    enum: PromoSectionLayout,
    description: '布局类型',
  })
  @ApiQuery({
    name: 'isEnabled',
    required: false,
    example: true,
    description: '启用状态',
  })
  @Get()
  findAll(@Query() queryDto: QueryPromoSectionsDto) {
    return this.promoSectionsService.findAll(queryDto);
  }

  @RequirePermissions('promo.section.view')
  @ApiOperation({ summary: '获取单个首页广告位详情' })
  @ApiParam({ name: 'id', description: '首页广告位 ID', example: 1 })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promoSectionsService.findOne(id);
  }

  @RequirePermissions('promo.section.update')
  @OperationLog({ module: '首页广告位管理', action: '修改首页广告位' })
  @ApiOperation({ summary: '修改首页广告位' })
  @ApiParam({ name: 'id', description: '首页广告位 ID', example: 1 })
  @ApiBody({ type: UpdatePromoSectionDto })
  @SuccessMessage('修改成功')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePromoSectionDto: UpdatePromoSectionDto,
  ) {
    return this.promoSectionsService.update(id, updatePromoSectionDto);
  }

  @RequirePermissions('promo.section.status.update')
  @OperationLog({
    module: '首页广告位管理',
    action: '修改首页广告位状态',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '修改首页广告位状态' })
  @ApiParam({ name: 'id', description: '首页广告位 ID', example: 1 })
  @ApiBody({ type: UpdatePromoSectionStatusDto })
  @SuccessMessage('修改成功')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePromoSectionStatusDto: UpdatePromoSectionStatusDto,
  ) {
    return this.promoSectionsService.updateStatus(id, updatePromoSectionStatusDto);
  }

  @RequirePermissions('promo.section.delete')
  @OperationLog({
    module: '首页广告位管理',
    action: '删除首页广告位',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '删除首页广告位' })
  @ApiParam({ name: 'id', description: '首页广告位 ID', example: 1 })
  @SuccessMessage('删除成功')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promoSectionsService.remove(id);
  }
}
