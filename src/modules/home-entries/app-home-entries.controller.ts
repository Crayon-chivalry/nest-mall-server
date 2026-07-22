import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HomeEntriesService } from './home-entries.service';

@ApiTags('AppHomeEntries')
@Controller('app/home-entries')
export class AppHomeEntriesController {
  constructor(private readonly homeEntriesService: HomeEntriesService) {}

  @ApiOperation({ summary: '获取前台启用中的金刚区入口列表' })
  @Get()
  findActiveList() {
    return this.homeEntriesService.findActiveList();
  }
}
