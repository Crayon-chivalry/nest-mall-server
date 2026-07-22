import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppBannersController } from './app-banners.controller';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { Banner } from './entities/banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [BannersController, AppBannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
