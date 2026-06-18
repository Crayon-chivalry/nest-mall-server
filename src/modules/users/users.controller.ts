import {
  Body,
  Controller,
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
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserPayPasswordDto } from './dto/update-user-pay-password.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '创建商城用户' })
  @ApiBody({ type: CreateUserDto })
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
  @OperationLog({ module: '用户管理', action: '查询用户列表' })
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
    description: '状态筛选：1 正常，0 冻结',
  })
  @Get()
  findAll(@Query() queryUsersDto: QueryUsersDto) {
    return this.usersService.findAll(queryUsersDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('user.view')
  @OperationLog({ module: '用户管理', action: '查询用户详情' })
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
  @OperationLog({ module: '用户管理', action: '修改用户基本信息' })
  @ApiOperation({ summary: '修改用户基本信息' })
  @ApiParam({
    name: 'userId',
    description: '用户业务编号',
    example: 'U1713259000123',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  @SuccessMessage('修改成功')
  @Patch(':userId')
  updateProfile(
    @Param('userId') userId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateUserProfileDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('user.password.update')
  @OperationLog({ module: '用户管理', action: '修改用户密码' })
  @ApiOperation({ summary: '修改用户密码' })
  @ApiParam({
    name: 'userId',
    description: '用户业务编号',
    example: 'U1713259000123',
  })
  @ApiBody({ type: UpdateUserPasswordDto })
  @SuccessMessage('修改成功')
  @Patch(':userId/password')
  updatePassword(
    @Param('userId') userId: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return this.usersService.updatePassword(userId, updateUserPasswordDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('user.password.update')
  @OperationLog({ module: '用户管理', action: '修改用户支付密码' })
  @ApiOperation({ summary: '修改用户支付密码' })
  @ApiParam({
    name: 'userId',
    description: '用户业务编号',
    example: 'U1713259000123',
  })
  @ApiBody({ type: UpdateUserPayPasswordDto })
  @SuccessMessage('修改成功')
  @Patch(':userId/pay-password')
  updatePayPassword(
    @Param('userId') userId: string,
    @Body() updateUserPayPasswordDto: UpdateUserPayPasswordDto,
  ) {
    return this.usersService.updatePayPassword(
      userId,
      updateUserPayPasswordDto,
    );
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('user.status.update')
  @OperationLog({ module: '用户管理', action: '修改用户状态' })
  @ApiOperation({ summary: '修改用户状态' })
  @ApiParam({
    name: 'userId',
    description: '用户业务编号',
    example: 'U1713259000123',
  })
  @ApiBody({ type: UpdateUserStatusDto })
  @SuccessMessage('修改成功')
  @Patch(':userId/status')
  updateStatus(
    @Param('userId') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(userId, updateUserStatusDto);
  }
}
