import { AppBaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('home_entries')
export class HomeEntry extends AppBaseEntity {
  @Column({ length: 100 })
  title!: string;

  @Column({ length: 255 })
  iconUrl!: string;

  @Column({ nullable: true, length: 255 })
  linkUrl?: string;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ default: true })
  isEnabled!: boolean;
}
