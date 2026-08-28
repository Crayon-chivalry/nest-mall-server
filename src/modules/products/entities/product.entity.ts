import { AppBaseEntity } from 'src/common/entities/base.entity';
import { ProductSpecType } from 'src/common/enums/product-spec-type.enum';
import { Category } from 'src/modules/categories/entities/category.entity';
import { CartItem } from 'src/modules/carts/entities/cart-item.entity';
import { OrderItem } from 'src/modules/orders/entities/order-item.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ProductSku } from './product-sku.entity';

@Entity('products')
export class Product extends AppBaseEntity {
  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'int', default: 0 })
  sales!: number;

  @Column({ nullable: true, length: 255 })
  cover?: string;

  @Column({ type: 'simple-json' })
  images!: string[];

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'longtext', nullable: true })
  detailContent?: string;

  @Column({ default: true })
  isOnSale!: boolean;

  @Column({
    type: 'enum',
    enum: ProductSpecType,
    default: ProductSpecType.SINGLE,
  })
  specType!: ProductSpecType;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  category!: Category;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];

  @OneToMany(() => ProductSku, (sku) => sku.product, {
    cascade: true,
  })
  skus!: ProductSku[];
}
