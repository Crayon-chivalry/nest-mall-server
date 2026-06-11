import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryAdminOperationLogsDto } from './dto/query-admin-operation-logs.dto';
import { LogsService } from './logs.service';

@ApiTags('Logs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @RequirePermissions('log.view')
  @ApiOperation({ summary: '分页获取后台操作日志' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    example: 10,
    description: '每页条数',
  })
  @ApiQuery({
    name: 'module',
    required: false,
    example: '用户管理',
    description: '模块筛选',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    example: '修改用户状态',
    description: '操作筛选',
  })
  @ApiQuery({
    name: 'operatorPhone',
    required: false,
    example: '13800138000',
    description: '操作人手机号筛选',
  })
  @ApiQuery({
    name: 'isSuccess',
    required: false,
    example: true,
    description: '是否成功筛选',
  })
  @Get('admin-operation')
  findAll(@Query() queryDto: QueryAdminOperationLogsDto) {
    return this.logsService.findAll(queryDto);
  }
}
