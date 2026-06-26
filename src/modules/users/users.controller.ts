import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUsersDto } from './dto/delete-users.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '创建商城用户' })
  @ApiBody({ type: CreateUserDto })
  @OperationLog({ module: '用户管理', action: '创建用户' })
  @SuccessMessage('创建成功')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @OperationLog({ module: '用户管理', action: '创建管理员账号' })
  @ApiOperation({ summary: '创建管理员账号' })
  @ApiBody({ type: CreateAdminDto })
  @SuccessMessage('创建成功')
  @Post('admin')
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.usersService.createAdmin(createAdminDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('user.view')
  @ApiOperation({ summary: '分页获取用户列表' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    example: 10,
    description: '每页条数',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    example: '13800138000',
    description: '手机号筛选',
  })
  @ApiQuery({
    name: 'nickname',
    required: false,
    example: '张',
    description: '昵称模糊搜索',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    example: 1,
    description: '状态筛选：1 正常，2 冻结',
  })
  @Get()
  findAll(@Query() queryUsersDto: QueryUsersDto) {
    return this.usersService.findAll(queryUsersDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('user.delete')
  @OperationLog({
    module: '用户管理',
    action: '批量删除用户',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '批量删除用户' })
  @ApiBody({ type: DeleteUsersDto })
  @SuccessMessage('删除成功')
  @Delete()
  remove(@Body() deleteUsersDto: DeleteUsersDto) {
    return this.usersService.remove(deleteUsersDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('user.view')
  @ApiOperation({ summary: '获取单个用户信息' })
  @ApiParam({
    name: 'userId',
    description: '用户业务编号',
    example: 'U1713259000123',
  })
  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.usersService.findOneByUserId(userId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('user.update')
  @OperationLog({ module: '用户管理', action: '修改用户信息' })
  @ApiOperation({ summary: '统一修改用户信息' })
  @ApiParam({
    name: 'userId',
    description: '用户业务编号',
    example: 'U1713259000123',
  })
  @ApiBody({ type: UpdateUserDto })
  @SuccessMessage('修改成功')
  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }
}
