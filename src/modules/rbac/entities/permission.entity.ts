import { AppBaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { AdminRole } from './role.entity';

@Entity('permissions')
export class Permission extends AppBaseEntity {
  @Column({ unique: true, length: 100 })
  code!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ nullable: true, length: 255 })
  description?: string;

  @Column({ default: true })
  isEnabled!: boolean;

  @ManyToMany(() => AdminRole, (role) => role.permissions)
  roles!: AdminRole[];
}
