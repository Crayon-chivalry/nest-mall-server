import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadedFileInfo } from './interfaces/uploaded-file.interface';
import { UploadsService } from './uploads.service';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiOperation({ summary: '公共图片上传' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '图片文件，支持 jpg、png、webp、gif',
        },
      },
      required: ['file'],
    },
  })
  @SuccessMessage('上传成功')
  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          const service = new UploadsService();
          callback(null, service.ensureImagesDir());
        },
        filename: (_request, file, callback) => {
          const extension = extname(file.originalname) || '.jpg';
          callback(null, `${Date.now()}-${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_request, file, callback) => {
        if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
          callback(
            new BadRequestException(
              '仅支持上传 jpg、png、webp、gif 格式图片',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadImage(
    @UploadedFile() file: UploadedFileInfo | undefined,
    @Req() request: Request,
  ) {
    if (!file) {
      throw new BadRequestException('请上传图片文件');
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('图片大小不能超过 5MB');
    }

    return this.uploadsService.buildImageResponse(file, request);
  }
}
