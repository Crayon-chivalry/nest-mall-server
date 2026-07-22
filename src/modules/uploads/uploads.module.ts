import { Module } from '@nestjs/common';
import { AppUploadsController } from './app-uploads.controller';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  controllers: [UploadsController, AppUploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
