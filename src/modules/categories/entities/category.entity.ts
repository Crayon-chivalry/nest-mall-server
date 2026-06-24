import { AppBaseEntity } from 'src/common/entities/base.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm';

@Entity('categories')
export class Category extends AppBaseEntity {
  @Column({ length: 50 })
  name!: string;

  @Column({ nullable: true, length: 255 })
  icon?: string;

  @Column({ default: true })
  isVisible!: boolean;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Category | null;

  @RelationId((category: Category) => category.parent)
  parentId?: number | null;

  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
