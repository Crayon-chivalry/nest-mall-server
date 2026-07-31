import { AppBaseEntity } from 'src/common/entities/base.entity';
import { ProductSku } from 'src/modules/products/entities/product-sku.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { ProductSkuSpec } from 'src/modules/products/entities/product-sku.entity';

@Entity('order_items')
export class OrderItem extends AppBaseEntity {
  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ length: 100 })
  productName!: string;

  @Column({ length: 100 })
  skuTitle!: string;

  @Column({ type: 'simple-json' })
  skuSpecs!: ProductSkuSpec[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  productCover?: string | null;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  order!: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  product!: Product;

  @ManyToOne(() => ProductSku, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  sku?: ProductSku | null;
}
