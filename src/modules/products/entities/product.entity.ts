import { AppBaseEntity } from 'src/common/entities/base.entity';
import { CartItem } from 'src/modules/carts/entities/cart-item.entity';
import { OrderItem } from 'src/modules/orders/entities/order-item.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('products')
export class Product extends AppBaseEntity {
  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ nullable: true, length: 255 })
  cover?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  isOnSale!: boolean;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  category!: Category;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];
}
