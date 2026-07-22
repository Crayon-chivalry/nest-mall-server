import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BannersService } from './banners.service';

@ApiTags('AppBanners')
@Controller('app/banners')
export class AppBannersController {
  constructor(private readonly bannersService: BannersService) {}

  @ApiOperation({ summary: '获取前台启用中的轮播图列表' })
  @Get()
  findActiveList() {
    return this.bannersService.findActiveList();
  }
}
