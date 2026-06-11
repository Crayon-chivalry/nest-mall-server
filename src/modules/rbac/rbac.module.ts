import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { AdminRole } from './entities/role.entity';
import { Menu } from './entities/menu.entity';
import { User } from '../users/entities/user.entity';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, AdminRole, Menu, User])],
  controllers: [RbacController],
  providers: [RbacService, PermissionsGuard],
  exports: [RbacService, PermissionsGuard, TypeOrmModule],
})
export class RbacModule {}
