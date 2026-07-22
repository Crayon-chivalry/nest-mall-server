import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppHomeEntriesController } from './app-home-entries.controller';
import { HomeEntriesController } from './home-entries.controller';
import { HomeEntriesService } from './home-entries.service';
import { HomeEntry } from './entities/home-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HomeEntry])],
  controllers: [HomeEntriesController, AppHomeEntriesController],
  providers: [HomeEntriesService],
  exports: [HomeEntriesService],
})
export class HomeEntriesModule {}
