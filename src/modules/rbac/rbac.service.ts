import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BUILTIN_ADMIN_ACCOUNT,
  BUILTIN_SUPER_ROLE_CODE,
  BUILTIN_SUPER_ROLE_NAME,
} from 'src/common/constants/builtin-admin.constants';
import { MenuType } from 'src/common/enums/menu-type.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { User } from 'src/modules/users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { AssignRoleMenusDto } from './dto/assign-role-menus.dto';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { DeleteRolesDto } from './dto/delete-roles.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Menu } from './entities/menu.entity';
import { Permission } from './entities/permission.entity';
import { AdminRole } from './entities/role.entity';
import { RouteTreeNode } from './interfaces/route-tree-node.interface';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(AdminRole)
    private readonly rolesRepository: Repository<AdminRole>,
    @InjectRepository(Menu)
    private readonly menusRepository: Repository<Menu>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createPermission(createPermissionDto: CreatePermissionDto) {
    const existing = await this.permissionsRepository.findOne({
      where: { code: createPermissionDto.code },
    });

    if (existing) {
      throw new BadRequestException('Permission code already exists');
    }

    const permission = this.permissionsRepository.create(createPermissionDto);
    const savedPermission = await this.permissionsRepository.save(permission);
    await this.refreshBuiltinAdminAccess();
    return savedPermission;
  }

  async updatePermission(
    permissionId: number,
    updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionsRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (
      updatePermissionDto.code &&
      updatePermissionDto.code !== permission.code
    ) {
      const existing = await this.permissionsRepository.findOne({
        where: { code: updatePermissionDto.code },
      });

      if (existing) {
        throw new BadRequestException('Permission code already exists');
      }
    }

    Object.assign(permission, updatePermissionDto);
    const savedPermission = await this.permissionsRepository.save(permission);
    await this.refreshBuiltinAdminAccess();
    return savedPermission;
  }

  async deletePermission(permissionId: number) {
    const permission = await this.permissionsRepository.findOne({
      where: { id: permissionId },
      relations: {
        roles: true,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.roles?.length) {
      for (const role of permission.roles) {
        const roleWithPermissions = await this.rolesRepository.findOne({
          where: { id: role.id },
          relations: {
            permissions: true,
          },
        });

        if (roleWithPermissions) {
          roleWithPermissions.permissions =
            roleWithPermissions.permissions.filter(
              (item) => item.id !== permissionId,
            );
          await this.rolesRepository.save(roleWithPermissions);
        }
      }
    }

    await this.permissionsRepository.remove(permission);
    await this.refreshBuiltinAdminAccess();

    return {
      id: permissionId,
      deleted: true,
    };
  }

  findAllPermissions() {
    return this.permissionsRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async initializeBannerManagementResources() {
    const permissionConfigs = [
      {
        code: 'banner.create',
        name: '创建轮播图',
        description: '用于创建轮播图数据',
      },
      {
        code: 'banner.view',
        name: '查看轮播图',
        description: '用于查看轮播图列表和详情',
      },
      {
        code: 'banner.update',
        name: '修改轮播图',
        description: '用于修改轮播图基础信息',
      },
      {
        code: 'banner.status.update',
        name: '修改轮播图状态',
        description: '用于启用或停用轮播图',
      },
      {
        code: 'banner.delete',
        name: '删除轮播图',
        description: '用于删除轮播图',
      },
    ];

    const permissions: Permission[] = [];

    for (const config of permissionConfigs) {
      let permission = await this.permissionsRepository.findOne({
        where: { code: config.code },
      });

      if (!permission) {
        permission = await this.permissionsRepository.save(
          this.permissionsRepository.create({
            ...config,
            isEnabled: true,
          }),
        );
      }

      permissions.push(permission);
    }

    let systemMenu = await this.menusRepository.findOne({
      where: { code: 'system' },
    });

    if (!systemMenu) {
      systemMenu = await this.menusRepository.save(
        this.menusRepository.create({
          name: '系统管理',
          code: 'system',
          type: MenuType.DIRECTORY,
          parentId: null,
          path: '/system',
          component: 'Layout',
          icon: 'Setting',
          sort: 1,
          isVisible: true,
          isEnabled: true,
        }),
      );
    }

    let bannerMenu = await this.menusRepository.findOne({
      where: { code: 'system_banner' },
    });

    if (!bannerMenu) {
      bannerMenu = await this.menusRepository.save(
        this.menusRepository.create({
          name: '轮播图管理',
          code: 'system_banner',
          type: MenuType.MENU,
          parentId: systemMenu.id,
          path: 'banner',
          component: 'system/banner/index',
          icon: 'Picture',
          permissionCode: 'banner.view',
          sort: 30,
          isVisible: true,
          isEnabled: true,
        }),
      );
    }

    return {
      permissions,
      menus: [systemMenu, bannerMenu],
    };
  }

  async initializeHomeEntryManagementResources() {
    const permissionConfigs = [
      {
        code: 'home.entry.create',
        name: '创建金刚区入口',
        description: '用于创建首页金刚区入口',
      },
      {
        code: 'home.entry.view',
        name: '查看金刚区入口',
        description: '用于查看首页金刚区入口列表和详情',
      },
      {
        code: 'home.entry.update',
        name: '修改金刚区入口',
        description: '用于修改首页金刚区入口信息',
      },
      {
        code: 'home.entry.status.update',
        name: '修改金刚区入口状态',
        description: '用于启用或停用首页金刚区入口',
      },
      {
        code: 'home.entry.delete',
        name: '删除金刚区入口',
        description: '用于删除首页金刚区入口',
      },
    ];

    const permissions: Permission[] = [];

    for (const config of permissionConfigs) {
      let permission = await this.permissionsRepository.findOne({
        where: { code: config.code },
      });

      if (!permission) {
        permission = await this.permissionsRepository.save(
          this.permissionsRepository.create({
            ...config,
            isEnabled: true,
          }),
        );
      }

      permissions.push(permission);
    }

    let contentMenu = await this.menusRepository.findOne({
      where: { code: 'content' },
    });

    if (!contentMenu) {
      contentMenu = await this.menusRepository.save(
        this.menusRepository.create({
          name: '内容管理',
          code: 'content',
          type: MenuType.DIRECTORY,
          parentId: null,
          path: '/content',
          component: 'Layout',
          icon: 'Appstore',
          sort: 2,
          isVisible: true,
          isEnabled: true,
        }),
      );
    }

    let homeEntryMenu = await this.menusRepository.findOne({
      where: { code: 'content_home_entry' },
    });

    if (!homeEntryMenu) {
      homeEntryMenu = await this.menusRepository.save(
        this.menusRepository.create({
          name: '金刚区入口',
          code: 'content_home_entry',
          type: MenuType.MENU,
          parentId: contentMenu.id,
          path: 'home-entries',
          component: 'content/home-entries/index',
          icon: 'AppstoreAdd',
          permissionCode: 'home.entry.view',
          sort: 10,
          isVisible: true,
          isEnabled: true,
        }),
      );
    }

    await this.refreshBuiltinAdminAccess();

    return {
      permissions,
      menus: [contentMenu, homeEntryMenu],
    };
  }

  async initializePromoSectionManagementResources() {
    const permissionConfigs = [
      {
        code: 'promo.section.create',
        name: '创建首页广告位',
        description: '用于创建首页广告位配置',
      },
      {
        code: 'promo.section.view',
        name: '查看首页广告位',
        description: '用于查看首页广告位列表和详情',
      },
      {
        code: 'promo.section.update',
        name: '修改首页广告位',
        description: '用于修改首页广告位信息',
      },
      {
        code: 'promo.section.status.update',
        name: '修改首页广告位状态',
        description: '用于启用或停用首页广告位',
      },
      {
        code: 'promo.section.delete',
        name: '删除首页广告位',
        description: '用于删除首页广告位',
      },
    ];

    const permissions: Permission[] = [];

    for (const config of permissionConfigs) {
      let permission = await this.permissionsRepository.findOne({
        where: { code: config.code },
      });

      if (!permission) {
        permission = await this.permissionsRepository.save(
          this.permissionsRepository.create({
            ...config,
            isEnabled: true,
          }),
        );
      }

      permissions.push(permission);
    }

    let contentMenu = await this.menusRepository.findOne({
      where: { code: 'content' },
    });

    if (!contentMenu) {
      contentMenu = await this.menusRepository.save(
        this.menusRepository.create({
          name: '内容管理',
          code: 'content',
          type: MenuType.DIRECTORY,
          parentId: null,
          path: '/content',
          component: 'Layout',
          icon: 'Appstore',
          sort: 2,
          isVisible: true,
          isEnabled: true,
        }),
      );
    }

    let promoSectionMenu = await this.menusRepository.findOne({
      where: { code: 'content_promo_section' },
    });

    if (!promoSectionMenu) {
      promoSectionMenu = await this.menusRepository.save(
        this.menusRepository.create({
          name: '首页广告位',
          code: 'content_promo_section',
          type: MenuType.MENU,
          parentId: contentMenu.id,
          path: 'promo-sections',
          component: 'content/promo-sections/index',
          icon: 'PictureRounded',
          permissionCode: 'promo.section.view',
          sort: 20,
          isVisible: true,
          isEnabled: true,
        }),
      );
    }

    await this.refreshBuiltinAdminAccess();

    return {
      permissions,
      menus: [contentMenu, promoSectionMenu],
    };
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const existing = await this.rolesRepository.findOne({
      where: { code: createRoleDto.code },
    });

    if (existing) {
      throw new BadRequestException('Role code already exists');
    }

    const permissions = createRoleDto.permissionIds?.length
      ? await this.permissionsRepository.find({
          where: { id: In(createRoleDto.permissionIds) },
        })
      : [];

    const role = this.rolesRepository.create({
      code: createRoleDto.code,
      name: createRoleDto.name,
      description: createRoleDto.description,
      isEnabled: createRoleDto.isEnabled ?? true,
      permissions,
    });

    return this.rolesRepository.save(role);
  }

  async updateRole(roleId: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: {
        permissions: true,
        menus: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.code === BUILTIN_SUPER_ROLE_CODE) {
      throw new BadRequestException('Builtin super admin role cannot be edited');
    }

    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existing = await this.rolesRepository.findOne({
        where: { code: updateRoleDto.code },
      });

      if (existing) {
        throw new BadRequestException('Role code already exists');
      }
    }

    if (updateRoleDto.permissionIds) {
      role.permissions = updateRoleDto.permissionIds.length
        ? await this.permissionsRepository.find({
            where: { id: In(updateRoleDto.permissionIds) },
          })
        : [];
    }

    if (updateRoleDto.code !== undefined) {
      role.code = updateRoleDto.code;
    }

    if (updateRoleDto.name !== undefined) {
      role.name = updateRoleDto.name;
    }

    if (updateRoleDto.description !== undefined) {
      role.description = updateRoleDto.description;
    }

    if (updateRoleDto.isEnabled !== undefined) {
      role.isEnabled = updateRoleDto.isEnabled;
    }

    return this.rolesRepository.save(role);
  }

  async deleteRole(deleteRolesDto: DeleteRolesDto) {
    const ids = [...new Set(deleteRolesDto.ids)];
    const roles = await this.rolesRepository.find({
      where: { id: In(ids) },
      relations: {
        users: true,
        permissions: true,
        menus: true,
      },
    });

    if (roles.length !== ids.length) {
      const foundIds = new Set(roles.map((role) => role.id));
      const missingIds = ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Roles not found: ${missingIds.join(', ')}`);
    }

    if (roles.some((role) => role.code === BUILTIN_SUPER_ROLE_CODE)) {
      throw new BadRequestException('Builtin super admin role cannot be deleted');
    }

    for (const role of roles) {
      role.permissions = [];
      role.menus = [];
      role.users = [];
    }

    await this.rolesRepository.save(roles);
    await this.rolesRepository.remove(roles);

    return {
      ids,
      deletedCount: roles.length,
      success: true,
    };
  }

  findAllRoles() {
    return this.rolesRepository.find({
      relations: {
        permissions: true,
        menus: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async assignBannerManagementResourcesToRole(roleId: number) {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: {
        permissions: true,
        menus: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.code === BUILTIN_SUPER_ROLE_CODE) {
      throw new BadRequestException('Builtin super admin role is managed automatically');
    }

    await this.initializeBannerManagementResources();

    const bannerMenu = await this.menusRepository.findOne({
      where: { code: 'system_banner' },
    });

    if (bannerMenu) {
      const menuMap = new Map((role.menus ?? []).map((menu) => [menu.id, menu]));
      menuMap.set(bannerMenu.id, bannerMenu);
      role.menus = [...menuMap.values()];
    }

    const currentMenus = role.menus ?? [];
    const menuPermissions = await this.getOrCreatePermissionsForMenus(currentMenus);
    role.permissions = this.mergeManualAndMenuPermissions(
      role.permissions ?? [],
      menuPermissions,
    );

    await this.rolesRepository.save(role);

    return this.rolesRepository.findOne({
      where: { id: roleId },
      relations: {
        permissions: true,
        menus: true,
      },
    });
  }

  async createMenu(createMenuDto: CreateMenuDto) {
    const existing = await this.menusRepository.findOne({
      where: { code: createMenuDto.code },
    });

    if (existing) {
      throw new BadRequestException('Menu code already exists');
    }

    if (createMenuDto.parentId) {
      const parent = await this.menusRepository.findOne({
        where: { id: createMenuDto.parentId },
      });

      if (!parent) {
        throw new BadRequestException('Parent menu not found');
      }
    }

    const menu = this.menusRepository.create({
      ...createMenuDto,
      permissionCode: this.normalizePermissionCode(createMenuDto.permissionCode),
      parentId: createMenuDto.parentId ?? null,
      sort: createMenuDto.sort ?? 0,
      isVisible: createMenuDto.isVisible ?? true,
      isEnabled: createMenuDto.isEnabled ?? true,
    });

    const savedMenu = await this.menusRepository.save(menu);
    await this.ensurePermissionExistsForMenu(savedMenu);
    await this.refreshBuiltinAdminAccess();
    return savedMenu;
  }

  async updateMenu(menuId: number, updateMenuDto: UpdateMenuDto) {
    const menu = await this.menusRepository.findOne({
      where: { id: menuId },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    if (updateMenuDto.code && updateMenuDto.code !== menu.code) {
      const existing = await this.menusRepository.findOne({
        where: { code: updateMenuDto.code },
      });

      if (existing) {
        throw new BadRequestException('Menu code already exists');
      }
    }

    if (updateMenuDto.parentId !== undefined) {
      if (updateMenuDto.parentId === menu.id) {
        throw new BadRequestException('Parent menu cannot be itself');
      }

      if (updateMenuDto.parentId !== null) {
        const parent = await this.menusRepository.findOne({
          where: { id: updateMenuDto.parentId },
        });

        if (!parent) {
          throw new BadRequestException('Parent menu not found');
        }
      }
    }

    Object.assign(menu, {
      ...updateMenuDto,
      permissionCode:
        updateMenuDto.permissionCode !== undefined
          ? this.normalizePermissionCode(updateMenuDto.permissionCode)
          : menu.permissionCode,
    });
    if (updateMenuDto.parentId !== undefined) {
      menu.parentId = updateMenuDto.parentId ?? null;
    }

    const savedMenu = await this.menusRepository.save(menu);
    await this.ensurePermissionExistsForMenu(savedMenu);
    await this.refreshBuiltinAdminAccess();
    return savedMenu;
  }

  async deleteMenu(menuId: number) {
    const menu = await this.menusRepository.findOne({
      where: { id: menuId },
      relations: {
        roles: true,
      },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    const childrenCount = await this.menusRepository.count({
      where: { parentId: menuId },
    });

    if (childrenCount > 0) {
      throw new BadRequestException('Current menu has child menus and cannot be deleted');
    }

    if (menu.roles?.length) {
      for (const role of menu.roles) {
        const roleWithMenus = await this.rolesRepository.findOne({
          where: { id: role.id },
          relations: {
            menus: true,
          },
        });

        if (roleWithMenus) {
          roleWithMenus.menus = roleWithMenus.menus.filter(
            (item) => item.id !== menuId,
          );
          await this.rolesRepository.save(roleWithMenus);
        }
      }
    }

    await this.menusRepository.remove(menu);
    await this.refreshBuiltinAdminAccess();

    return {
      id: menuId,
      deleted: true,
    };
  }

  async findAllMenus(): Promise<RouteTreeNode[]> {
    const menus = await this.menusRepository.find({
      order: {
        sort: 'ASC',
        id: 'ASC',
      },
    });

    return this.buildMenuTree(menus);
  }

  async assignRolesToUser(userId: string, assignUserRolesDto: AssignUserRolesDto) {
    const user = await this.usersRepository.findOne({
      where: { userId },
      relations: {
        adminRoles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only admin users can be assigned backend roles');
    }

    const roles = assignUserRolesDto.roleIds.length
      ? await this.rolesRepository.find({
          where: { id: In(assignUserRolesDto.roleIds) },
          relations: {
            permissions: true,
            menus: true,
          },
        })
      : [];

    if (user.account === BUILTIN_ADMIN_ACCOUNT) {
      const builtinRole = await this.ensureBuiltinSuperAdminRole();
      const roleMap = new Map<number, AdminRole>(roles.map((role) => [role.id, role]));
      roleMap.set(builtinRole.id, builtinRole);
      user.adminRoles = [...roleMap.values()];
    } else {
      user.adminRoles = roles;
    }

    const savedUser = await this.usersRepository.save(user);

    return this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: {
        adminRoles: {
          permissions: true,
          menus: true,
        },
      },
    });
  }

  async assignMenusToRole(roleId: number, assignRoleMenusDto: AssignRoleMenusDto) {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: {
        menus: true,
        permissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.code === BUILTIN_SUPER_ROLE_CODE) {
      throw new BadRequestException('Builtin super admin role is managed automatically');
    }

    const selectedMenus = assignRoleMenusDto.menuIds.length
      ? await this.menusRepository.find({
          where: { id: In(assignRoleMenusDto.menuIds) },
        })
      : [];

    const menus = await this.expandMenusWithAncestors(selectedMenus);
    const menuPermissions = await this.getOrCreatePermissionsForMenus(menus);

    role.menus = menus;
    role.permissions = this.mergeManualAndMenuPermissions(
      role.permissions ?? [],
      menuPermissions,
    );
    return this.rolesRepository.save(role);
  }

  async getUserPermissionCodes(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: {
        adminRoles: {
          permissions: true,
        },
      },
    });

    if (!user) {
      return [];
    }

    if (user.account === BUILTIN_ADMIN_ACCOUNT) {
      const permissions = await this.permissionsRepository.find({
        where: { isEnabled: true },
        order: { id: 'ASC' },
      });
      return permissions.map((permission) => permission.code);
    }

    const permissionCodes = new Set<string>();

    for (const role of user.adminRoles ?? []) {
      if (!role.isEnabled) {
        continue;
      }

      for (const permission of role.permissions ?? []) {
        if (permission.isEnabled) {
          permissionCodes.add(permission.code);
        }
      }
    }

    return [...permissionCodes];
  }

  async getCurrentUserRoutes(userId: number): Promise<RouteTreeNode[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: {
        adminRoles: {
          menus: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Current user is not an admin');
    }

    if (user.account === BUILTIN_ADMIN_ACCOUNT) {
      const menus = await this.menusRepository.find({
        where: {
          isEnabled: true,
          isVisible: true,
        },
        order: {
          sort: 'ASC',
          id: 'ASC',
        },
      });

      return this.buildRouteTree(menus);
    }

    const menuMap = new Map<number, Menu>();

    for (const role of user.adminRoles ?? []) {
      if (!role.isEnabled) {
        continue;
      }

      for (const menu of role.menus ?? []) {
        if (menu.isEnabled && menu.isVisible) {
          menuMap.set(menu.id, menu);
        }
      }
    }

    const menus = [...menuMap.values()].sort((a, b) => {
      if (a.sort !== b.sort) {
        return a.sort - b.sort;
      }
      return a.id - b.id;
    });

    return this.buildRouteTree(menus);
  }

  async ensureBuiltinAdminAccess(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { userId },
      relations: {
        adminRoles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.account !== BUILTIN_ADMIN_ACCOUNT || user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Target user is not builtin admin');
    }

    const builtinRole = await this.ensureBuiltinSuperAdminRole();
    const roleMap = new Map<number, AdminRole>(
      (user.adminRoles ?? []).map((role) => [role.id, role]),
    );
    roleMap.set(builtinRole.id, builtinRole);
    user.adminRoles = [...roleMap.values()];
    await this.usersRepository.save(user);
  }

  private buildMenuTree(menus: Menu[]): RouteTreeNode[] {
    const menuMap = new Map<number, RouteTreeNode>();
    const roots: RouteTreeNode[] = [];

    for (const menu of menus) {
      menuMap.set(menu.id, {
        id: menu.id,
        parentId: menu.parentId,
        name: menu.name,
        code: menu.code,
        type: menu.type,
        path: menu.path,
        component: menu.component,
        icon: menu.icon,
        permissionCode: menu.permissionCode,
        sort: menu.sort,
        children: [],
      });
    }

    for (const menu of menus) {
      const node = menuMap.get(menu.id)!;
      if (!menu.parentId) {
        roots.push(node);
        continue;
      }

      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  private buildRouteTree(menus: Menu[]): RouteTreeNode[] {
    return this.buildMenuTree(menus);
  }

  private normalizePermissionCode(permissionCode?: string | null) {
    const normalized = permissionCode?.trim();
    return normalized ? normalized : undefined;
  }

  private shouldSyncMenuPermission(menu: Pick<Menu, 'type' | 'permissionCode'>) {
    if (!menu.permissionCode) {
      return false;
    }

    return menu.type === MenuType.MENU || menu.type === MenuType.ACTION;
  }

  private async ensurePermissionExistsForMenu(menu: Menu) {
    if (!this.shouldSyncMenuPermission(menu)) {
      return null;
    }

    const existing = await this.permissionsRepository.findOne({
      where: { code: menu.permissionCode },
    });

    if (existing) {
      return existing;
    }

    return this.permissionsRepository.save(
      this.permissionsRepository.create({
        code: menu.permissionCode,
        name: `${menu.name} permission`,
        description: `Auto-created from menu: ${menu.name}`,
        isEnabled: true,
      }),
    );
  }

  private async getOrCreatePermissionsForMenus(menus: Menu[]) {
    const permissions: Permission[] = [];

    for (const menu of menus) {
      const permission = await this.ensurePermissionExistsForMenu(menu);
      if (permission) {
        permissions.push(permission);
      }
    }

    return permissions;
  }

  private async expandMenusWithAncestors(selectedMenus: Menu[]) {
    if (selectedMenus.length === 0) {
      return [];
    }

    const allMenus = await this.menusRepository.find({
      order: {
        sort: 'ASC',
        id: 'ASC',
      },
    });
    const allMenuMap = new Map(allMenus.map((menu) => [menu.id, menu]));
    const selectedMenuMap = new Map<number, Menu>();

    for (const menu of selectedMenus) {
      let current: Menu | undefined = menu;

      while (current) {
        selectedMenuMap.set(current.id, current);

        if (!current.parentId) {
          break;
        }

        current = allMenuMap.get(current.parentId);
      }
    }

    return allMenus.filter((menu) => selectedMenuMap.has(menu.id));
  }

  private mergeManualAndMenuPermissions(
    existingPermissions: Permission[],
    menuPermissions: Permission[],
  ) {
    const menuPermissionCodes = new Set(menuPermissions.map((item) => item.code));
    const retainedManualPermissions = existingPermissions.filter(
      (permission) => !menuPermissionCodes.has(permission.code),
    );

    const permissionMap = new Map<number, Permission>();

    for (const permission of retainedManualPermissions) {
      permissionMap.set(permission.id, permission);
    }

    for (const permission of menuPermissions) {
      permissionMap.set(permission.id, permission);
    }

    return [...permissionMap.values()];
  }

  private async ensureBuiltinSuperAdminRole() {
    let role = await this.rolesRepository.findOne({
      where: { code: BUILTIN_SUPER_ROLE_CODE },
      relations: {
        permissions: true,
        menus: true,
      },
    });

    if (!role) {
      role = await this.rolesRepository.save(
        this.rolesRepository.create({
          code: BUILTIN_SUPER_ROLE_CODE,
          name: BUILTIN_SUPER_ROLE_NAME,
          description: 'System builtin super administrator role',
          isEnabled: true,
          permissions: [],
          menus: [],
        }),
      );
    }

    await this.syncBuiltinSuperAdminRole(role.id);

    return (
      (await this.rolesRepository.findOne({
        where: { id: role.id },
        relations: {
          permissions: true,
          menus: true,
        },
      })) ?? role
    );
  }

  private async syncBuiltinSuperAdminRole(roleId: number) {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: {
        permissions: true,
        menus: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const [permissions, menus] = await Promise.all([
      this.permissionsRepository.find({
        where: { isEnabled: true },
        order: { id: 'ASC' },
      }),
      this.menusRepository.find({
        where: { isEnabled: true },
        order: { sort: 'ASC', id: 'ASC' },
      }),
    ]);

    role.isEnabled = true;
    role.permissions = permissions;
    role.menus = menus;
    await this.rolesRepository.save(role);
  }

  private async refreshBuiltinAdminAccess() {
    const user = await this.usersRepository.findOne({
      where: { account: BUILTIN_ADMIN_ACCOUNT },
      select: ['id', 'userId'],
    });

    if (user) {
      await this.ensureBuiltinAdminAccess(user.userId);
    }
  }
}
