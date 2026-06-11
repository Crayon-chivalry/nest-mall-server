import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../constants/rbac.constants';

export function RequirePermissions(...permissions: string[]) {
  return SetMetadata(PERMISSIONS_KEY, permissions);
}
