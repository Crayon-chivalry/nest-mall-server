import { AppBaseEntity } from 'src/common/entities/base.entity';
import { PromoSectionLayout } from 'src/common/enums/promo-section-layout.enum';
import { Column, Entity } from 'typeorm';

export interface PromoSectionImageItem {
  title?: string;
  imageUrl: string;
  linkUrl?: string;
}

@Entity('promo_sections')
export class PromoSection extends AppBaseEntity {
  @Column({ length: 100 })
  title!: string;

  @Column({
    type: 'enum',
    enum: PromoSectionLayout,
    default: PromoSectionLayout.SINGLE,
  })
  layoutType!: PromoSectionLayout;

  @Column({ type: 'simple-json' })
  imageItems!: PromoSectionImageItem[];

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ default: true })
  isEnabled!: boolean;
}
