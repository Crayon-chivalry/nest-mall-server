import { AppBaseEntity } from 'src/common/entities/base.entity';
import { MenuType } from 'src/common/enums/menu-type.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AdminRole } from './role.entity';

@Entity('menus')
export class Menu extends AppBaseEntity {
  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 100 })
  code!: string;

  @Column({
    type: 'tinyint',
    default: MenuType.MENU,
  })
  type!: MenuType;

  @Column({ type: 'int', nullable: true, default: null })
  parentId!: number | null;

  @ManyToOne(() => Menu, (menu) => menu.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Menu | null;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children!: Menu[];

  @Column({ length: 255, nullable: true })
  path?: string;

  @Column({ length: 255, nullable: true })
  component?: string;

  @Column({ length: 100, nullable: true })
  icon?: string;

  @Column({ nullable: true, length: 100 })
  permissionCode?: string;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ default: true })
  isVisible!: boolean;

  @Column({ default: true })
  isEnabled!: boolean;

  @ManyToMany(() => AdminRole, (role) => role.menus)
  roles!: AdminRole[];
}
