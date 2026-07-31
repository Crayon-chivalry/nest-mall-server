import { AppBaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

export interface ProductSkuSpec {
  name: string;
  value: string;
}

@Entity('product_skus')
export class ProductSku extends AppBaseEntity {
  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'simple-json' })
  specs!: ProductSkuSpec[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ nullable: true, length: 255 })
  cover?: string;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ default: false })
  isDefault!: boolean;

  @ManyToOne(() => Product, (product) => product.skus, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  product!: Product;
}
