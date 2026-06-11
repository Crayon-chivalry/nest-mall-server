import { AppBaseEntity } from 'src/common/entities/base.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { AdminRole } from 'src/modules/rbac/entities/role.entity';
import { Cart } from 'src/modules/carts/entities/cart.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('users')
export class User extends AppBaseEntity {
  @Column({ unique: true, length: 32 })
  userId!: string;

  @Column({ unique: true, length: 20 })
  phone!: string;

  @Column({ length: 100 })
  password!: string;

  @Column({ length: 30 })
  nickname!: string;

  @Column({ length: 255, nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Column({
    type: 'tinyint',
    default: UserStatus.NORMAL,
  })
  status!: UserStatus;

  @ManyToMany(() => AdminRole, (adminRole) => adminRole.users)
  @JoinTable({
    name: 'admin_user_roles',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
  })
  adminRoles!: AdminRole[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart!: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];
}
