import { AppBaseEntity } from 'src/common/entities/base.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends AppBaseEntity {
  @Column({ unique: true, length: 32 })
  orderNo!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ nullable: true, length: 255 })
  remark?: string;

  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  user!: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items!: OrderItem[];
}
