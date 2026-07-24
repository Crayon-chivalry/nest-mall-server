import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppPromoSectionsController } from './app-promo-sections.controller';
import { PromoSectionsController } from './promo-sections.controller';
import { PromoSection } from './entities/promo-section.entity';
import { PromoSectionsService } from './promo-sections.service';

@Module({
  imports: [TypeOrmModule.forFeature([PromoSection])],
  controllers: [PromoSectionsController, AppPromoSectionsController],
  providers: [PromoSectionsService],
  exports: [PromoSectionsService],
})
export class PromoSectionsModule {}
