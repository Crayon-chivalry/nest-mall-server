import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeEntriesController } from './home-entries.controller';
import { HomeEntriesService } from './home-entries.service';
import { HomeEntry } from './entities/home-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HomeEntry])],
  controllers: [HomeEntriesController],
  providers: [HomeEntriesService],
  exports: [HomeEntriesService],
})
export class HomeEntriesModule {}
