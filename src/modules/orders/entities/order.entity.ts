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

  @Column({ length: 20 })
  receiverName!: string;

  @Column({ length: 20 })
  receiverPhone!: string;

  @Column({ length: 50 })
  province!: string;

  @Column({ length: 50 })
  city!: string;

  @Column({ length: 50 })
  district!: string;

  @Column({ length: 255 })
  detailAddress!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string | null;

  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  user!: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items!: OrderItem[];
}
