import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { OperationLog } from 'src/common/decorators/operation-log.decorator';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { OperationLogType } from 'src/common/enums/operation-log-type.enum';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { AssignRoleMenusDto } from './dto/assign-role-menus.dto';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RouteTreeNode } from './interfaces/route-tree-node.interface';
import { RbacService } from './rbac.service';

@ApiTags('AdminRBAC')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @RequirePermissions('rbac.permission.create')
  @OperationLog({ module: '权限管理', action: '创建权限' })
  @ApiOperation({ summary: '创建权限' })
  @ApiBody({ type: CreatePermissionDto })
  @SuccessMessage('创建成功')
  @Post('permissions')
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(createPermissionDto);
  }

  @RequirePermissions('rbac.permission.view')
  @ApiOperation({ summary: '获取权限列表' })
  @Get('permissions')
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @RequirePermissions('rbac.menu.create')
  @OperationLog({
    module: '轮播图管理',
    action: '初始化轮播图权限和菜单',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '初始化轮播图管理权限和菜单' })
  @SuccessMessage('初始化成功')
  @Post('bootstrap/banner-management')
  initializeBannerManagementResources() {
    return this.rbacService.initializeBannerManagementResources();
  }

  @RequirePermissions('rbac.permission.update')
  @OperationLog({ module: '权限管理', action: '更新权限' })
  @ApiOperation({ summary: '更新权限' })
  @ApiParam({ name: 'permissionId', description: '权限 ID', example: '1' })
  @ApiBody({ type: UpdatePermissionDto })
  @SuccessMessage('修改成功')
  @Patch('permissions/:permissionId')
  updatePermission(
    @Param('permissionId') permissionId: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.rbacService.updatePermission(
      Number(permissionId),
      updatePermissionDto,
    );
  }

  @RequirePermissions('rbac.permission.delete')
  @OperationLog({
    module: '权限管理',
    action: '删除权限',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '删除权限' })
  @ApiParam({ name: 'permissionId', description: '权限 ID', example: '1' })
  @SuccessMessage('删除成功')
  @Delete('permissions/:permissionId')
  deletePermission(@Param('permissionId') permissionId: string) {
    return this.rbacService.deletePermission(Number(permissionId));
  }

  @RequirePermissions('rbac.role.create')
  @OperationLog({ module: '角色管理', action: '创建角色' })
  @ApiOperation({ summary: '创建角色' })
  @ApiBody({ type: CreateRoleDto })
  @SuccessMessage('创建成功')
  @Post('roles')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(createRoleDto);
  }

  @RequirePermissions('rbac.role.view')
  @ApiOperation({ summary: '获取角色列表' })
  @Get('roles')
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @RequirePermissions('rbac.role.update', 'rbac.role.assign_menu')
  @OperationLog({
    module: '轮播图管理',
    action: '给角色分配轮播图管理资源',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '给角色一键分配轮播图管理权限和菜单' })
  @ApiParam({ name: 'roleId', description: '角色 ID', example: '1' })
  @SuccessMessage('分配成功')
  @Post('roles/:roleId/banner-management')
  assignBannerManagementResourcesToRole(@Param('roleId') roleId: string) {
    return this.rbacService.assignBannerManagementResourcesToRole(
      Number(roleId),
    );
  }

  @RequirePermissions('rbac.role.update')
  @OperationLog({ module: '角色管理', action: '更新角色' })
  @ApiOperation({ summary: '更新角色' })
  @ApiParam({ name: 'roleId', description: '角色 ID', example: '1' })
  @ApiBody({ type: UpdateRoleDto })
  @SuccessMessage('修改成功')
  @Patch('roles/:roleId')
  updateRole(
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rbacService.updateRole(Number(roleId), updateRoleDto);
  }

  @RequirePermissions('rbac.role.delete')
  @OperationLog({
    module: '角色管理',
    action: '删除角色',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '删除角色' })
  @ApiParam({ name: 'roleId', description: '角色 ID', example: '1' })
  @SuccessMessage('删除成功')
  @Delete('roles/:roleId')
  deleteRole(@Param('roleId') roleId: string) {
    return this.rbacService.deleteRole(Number(roleId));
  }

  @RequirePermissions('rbac.menu.create')
  @OperationLog({ module: '菜单管理', action: '创建菜单' })
  @ApiOperation({ summary: '创建菜单' })
  @ApiBody({ type: CreateMenuDto })
  @SuccessMessage('创建成功')
  @Post('menus')
  createMenu(@Body() createMenuDto: CreateMenuDto) {
    return this.rbacService.createMenu(createMenuDto);
  }

  @RequirePermissions('rbac.menu.view')
  @ApiOperation({ summary: '获取菜单树' })
  @Get('menus')
  findAllMenus(): Promise<RouteTreeNode[]> {
    return this.rbacService.findAllMenus();
  }

  @RequirePermissions('rbac.menu.update')
  @OperationLog({ module: '菜单管理', action: '更新菜单' })
  @ApiOperation({ summary: '更新菜单' })
  @ApiParam({ name: 'menuId', description: '菜单 ID', example: '1' })
  @ApiBody({ type: UpdateMenuDto })
  @SuccessMessage('修改成功')
  @Patch('menus/:menuId')
  updateMenu(
    @Param('menuId') menuId: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.rbacService.updateMenu(Number(menuId), updateMenuDto);
  }

  @RequirePermissions('rbac.menu.delete')
  @OperationLog({
    module: '菜单管理',
    action: '删除菜单',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '删除菜单' })
  @ApiParam({ name: 'menuId', description: '菜单 ID', example: '1' })
  @SuccessMessage('删除成功')
  @Delete('menus/:menuId')
  deleteMenu(@Param('menuId') menuId: string) {
    return this.rbacService.deleteMenu(Number(menuId));
  }

  @RequirePermissions('rbac.user.assign_role')
  @OperationLog({
    module: '角色分配',
    action: '给管理员分配角色',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '给管理员用户分配角色' })
  @ApiParam({
    name: 'userId',
    description: '管理员用户业务编号',
    example: 'U1713259000123',
  })
  @ApiBody({ type: AssignUserRolesDto })
  @SuccessMessage('分配成功')
  @Patch('users/:userId/roles')
  assignRolesToUser(
    @Param('userId') userId: string,
    @Body() assignUserRolesDto: AssignUserRolesDto,
  ) {
    return this.rbacService.assignRolesToUser(userId, assignUserRolesDto);
  }

  @RequirePermissions('rbac.role.assign_menu')
  @OperationLog({
    module: '角色分配',
    action: '给角色分配菜单',
    type: OperationLogType.DANGEROUS,
  })
  @ApiOperation({ summary: '给角色分配菜单' })
  @ApiParam({
    name: 'roleId',
    description: '角色 ID',
    example: '1',
  })
  @ApiBody({ type: AssignRoleMenusDto })
  @SuccessMessage('分配成功')
  @Patch('roles/:roleId/menus')
  assignMenusToRole(
    @Param('roleId') roleId: string,
    @Body() assignRoleMenusDto: AssignRoleMenusDto,
  ) {
    return this.rbacService.assignMenusToRole(
      Number(roleId),
      assignRoleMenusDto,
    );
  }

  @ApiOperation({ summary: '获取当前管理员后台路由树' })
  @Get('routes/current')
  getCurrentUserRoutes(
    @CurrentUser() user: RequestUser,
  ): Promise<RouteTreeNode[]> {
    return this.rbacService.getCurrentUserRoutes(user.id);
  }
}
