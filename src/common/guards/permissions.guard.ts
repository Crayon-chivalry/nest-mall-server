import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { BUILTIN_ADMIN_ACCOUNT } from 'src/common/constants/builtin-admin.constants';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RequestUser } from 'src/modules/auth/interfaces/request-user.interface';
import { PERMISSIONS_KEY } from '../constants/rbac.constants';

interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('当前用户未登录');
    }

    if (user.account === BUILTIN_ADMIN_ACCOUNT) {
      return true;
    }

    if (
      user.role === UserRole.ADMIN &&
      (!user.permissions || user.permissions.length === 0)
    ) {
      return true;
    }

    const userPermissions = user.permissions ?? [];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('当前用户没有访问权限');
    }

    return true;
  }
}
