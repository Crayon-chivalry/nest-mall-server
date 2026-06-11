import { AppBaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('banners')
export class Banner extends AppBaseEntity {
  @Column({ length: 100 })
  title!: string;

  @Column({ length: 255 })
  imageUrl!: string;

  @Column({ nullable: true, length: 255 })
  linkUrl?: string;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ default: true })
  isEnabled!: boolean;

  @Column({ type: 'datetime', nullable: true })
  startTime?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  endTime?: Date | null;
}
