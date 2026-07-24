import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromoSectionsService } from './promo-sections.service';

@ApiTags('AppPromoSections')
@Controller('app/promo-sections')
export class AppPromoSectionsController {
  constructor(private readonly promoSectionsService: PromoSectionsService) {}

  @ApiOperation({ summary: '获取前台启用中的首页广告位列表' })
  @Get()
  findActiveList() {
    return this.promoSectionsService.findActiveList();
  }
}
