import { AppBaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('shipping_addresses')
export class ShippingAddress extends AppBaseEntity {
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

  @Column({ type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  addressTag?: string | null;

  @ManyToOne(() => User, (user) => user.shippingAddresses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;
}
