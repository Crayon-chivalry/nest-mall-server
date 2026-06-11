import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuType } from 'src/common/enums/menu-type.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { User } from 'src/modules/users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { AssignRoleMenusDto } from './dto/assign-role-menus.dto';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
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
      throw new BadRequestException('权限编码已存在');
    }

    const permission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async updatePermission(permissionId: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionsRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existing = await this.permissionsRepository.findOne({
        where: { code: updatePermissionDto.code },
      });

      if (existing) {
        throw new BadRequestException('权限编码已存在');
      }
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async deletePermission(permissionId: number) {
    const permission = await this.permissionsRepository.findOne({
      where: { id: permissionId },
      relations: {
        roles: true,
      },
    });

    if (!permission) {
      throw new NotFoundException('权限不存在');
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

  async createRole(createRoleDto: CreateRoleDto) {
    const existing = await this.rolesRepository.findOne({
      where: { code: createRoleDto.code },
    });

    if (existing) {
      throw new BadRequestException('角色编码已存在');
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
      throw new NotFoundException('角色不存在');
    }

    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existing = await this.rolesRepository.findOne({
        where: { code: updateRoleDto.code },
      });

      if (existing) {
        throw new BadRequestException('角色编码已存在');
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

  async deleteRole(roleId: number) {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: {
        users: true,
        permissions: true,
        menus: true,
      },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    role.permissions = [];
    role.menus = [];
    role.users = [];
    await this.rolesRepository.save(role);
    await this.rolesRepository.remove(role);

    return {
      id: roleId,
      deleted: true,
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
      throw new NotFoundException('角色不存在');
    }

    await this.initializeBannerManagementResources();

    const permissions = await this.permissionsRepository.find({
      where: {
        code: In([
          'banner.create',
          'banner.view',
          'banner.update',
          'banner.status.update',
          'banner.delete',
        ]),
      },
    });

    const bannerMenu = await this.menusRepository.findOne({
      where: { code: 'system_banner' },
    });

    const permissionMap = new Map(
      (role.permissions ?? []).map((permission) => [permission.id, permission]),
    );

    for (const permission of permissions) {
      permissionMap.set(permission.id, permission);
    }

    role.permissions = [...permissionMap.values()];

    if (bannerMenu) {
      const menuMap = new Map((role.menus ?? []).map((menu) => [menu.id, menu]));
      menuMap.set(bannerMenu.id, bannerMenu);
      role.menus = [...menuMap.values()];
    }

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
      throw new BadRequestException('菜单编码已存在');
    }

    if (createMenuDto.parentId) {
      const parent = await this.menusRepository.findOne({
        where: { id: createMenuDto.parentId },
      });

      if (!parent) {
        throw new BadRequestException('父级菜单不存在');
      }
    }

    const menu = this.menusRepository.create({
      ...createMenuDto,
      parentId: createMenuDto.parentId ?? null,
      sort: createMenuDto.sort ?? 0,
      isVisible: createMenuDto.isVisible ?? true,
      isEnabled: createMenuDto.isEnabled ?? true,
    });

    return this.menusRepository.save(menu);
  }

  async updateMenu(menuId: number, updateMenuDto: UpdateMenuDto) {
    const menu = await this.menusRepository.findOne({
      where: { id: menuId },
    });

    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    if (updateMenuDto.code && updateMenuDto.code !== menu.code) {
      const existing = await this.menusRepository.findOne({
        where: { code: updateMenuDto.code },
      });

      if (existing) {
        throw new BadRequestException('菜单编码已存在');
      }
    }

    if (updateMenuDto.parentId !== undefined) {
      if (updateMenuDto.parentId === menu.id) {
        throw new BadRequestException('父级菜单不能选择自己');
      }

      if (updateMenuDto.parentId !== null) {
        const parent = await this.menusRepository.findOne({
          where: { id: updateMenuDto.parentId },
        });

        if (!parent) {
          throw new BadRequestException('父级菜单不存在');
        }
      }
    }

    Object.assign(menu, updateMenuDto);
    if (updateMenuDto.parentId !== undefined) {
      menu.parentId = updateMenuDto.parentId ?? null;
    }

    return this.menusRepository.save(menu);
  }

  async deleteMenu(menuId: number) {
    const menu = await this.menusRepository.findOne({
      where: { id: menuId },
      relations: {
        roles: true,
      },
    });

    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    const childrenCount = await this.menusRepository.count({
      where: { parentId: menuId },
    });

    if (childrenCount > 0) {
      throw new BadRequestException('当前菜单存在子菜单，不能删除');
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
      throw new NotFoundException('用户不存在');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('只有管理员用户才能分配后台角色');
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

    user.adminRoles = roles;
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
      },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const menus = assignRoleMenusDto.menuIds.length
      ? await this.menusRepository.find({
          where: { id: In(assignRoleMenusDto.menuIds) },
        })
      : [];

    role.menus = menus;
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
      throw new NotFoundException('用户不存在');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('当前用户不是管理员');
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

  private buildMenuTree(menus: Menu[]): RouteTreeNode[] {
    const menuMap = new Map<number, RouteTreeNode>();
    const roots: RouteTreeNode[] = [];

    for (const menu of menus) {
      menuMap.set(menu.id, {
        id: menu.id,
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
}
