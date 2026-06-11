import { AppBaseEntity } from 'src/common/entities/base.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('categories')
export class Category extends AppBaseEntity {
  @Column({ unique: true, length: 50 })
  name!: string;

  @Column({ nullable: true, length: 255 })
  description?: string;

  @Column({ default: true })
  isVisible!: boolean;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
