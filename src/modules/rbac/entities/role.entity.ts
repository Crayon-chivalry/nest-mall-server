import { AppBaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Menu } from './menu.entity';
import { Permission } from './permission.entity';

@Entity('admin_roles')
export class AdminRole extends AppBaseEntity {
  @Column({ unique: true, length: 50 })
  code!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ nullable: true, length: 255 })
  description?: string;

  @Column({ default: true })
  isEnabled!: boolean;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: false,
  })
  @JoinTable({
    name: 'admin_role_permissions',
  })
  permissions!: Permission[];

  @ManyToMany(() => Menu, (menu) => menu.roles, {
    cascade: false,
  })
  @JoinTable({
    name: 'admin_role_menus',
  })
  menus!: Menu[];

  @ManyToMany(() => User, (user) => user.adminRoles)
  users!: User[];
}
