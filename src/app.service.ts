import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BUILTIN_ADMIN_ACCOUNT,
  BUILTIN_ADMIN_DEFAULT_PASSWORD,
  BUILTIN_ADMIN_NICKNAME,
} from './common/constants/builtin-admin.constants';
import { RbacService } from './modules/rbac/rbac.service';
import { UsersService } from './modules/users/users.service';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
  ) {}

  getHealth() {
    return 'ok';
  }

  async onApplicationBootstrap() {
    const password =
      this.configService.get<string>('BUILTIN_ADMIN_PASSWORD') ??
      BUILTIN_ADMIN_DEFAULT_PASSWORD;

    const adminUser = await this.usersService.ensureBuiltinAdmin({
      account: BUILTIN_ADMIN_ACCOUNT,
      password,
      nickname: BUILTIN_ADMIN_NICKNAME,
    });

    await this.rbacService.initializeBannerManagementResources();
    await this.rbacService.initializeHomeEntryManagementResources();
    await this.rbacService.initializePromoSectionManagementResources();
    await this.rbacService.ensureBuiltinAdminAccess(adminUser.userId);

    this.logger.log(
      `Builtin admin ensured: account=${BUILTIN_ADMIN_ACCOUNT}, userId=${adminUser.userId}`,
    );
  }
}
