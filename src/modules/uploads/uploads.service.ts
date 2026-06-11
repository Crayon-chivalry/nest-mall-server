import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { UploadedFileInfo } from './interfaces/uploaded-file.interface';

@Injectable()
export class UploadsService {
  getUploadRootDir() {
    return join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads');
  }

  getImagesDir() {
    return join(this.getUploadRootDir(), 'images');
  }

  ensureImagesDir() {
    const imagesDir = this.getImagesDir();

    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir, { recursive: true });
    }

    return imagesDir;
  }

  buildImageResponse(file: UploadedFileInfo, request: RequestLike) {
    const uploadPrefix = this.getUploadPrefix();
    const relativePath = `${uploadPrefix}/images/${file.filename}`;
    const fileUrl = `${request.protocol}://${request.get('host')}${relativePath}`;

    return {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: relativePath,
      url: fileUrl,
    };
  }

  private getUploadPrefix() {
    const configuredPrefix = process.env.UPLOAD_PREFIX ?? '/uploads';
    return configuredPrefix.startsWith('/')
      ? configuredPrefix
      : `/${configuredPrefix}`;
  }
}

interface RequestLike {
  protocol: string;
  get(name: string): string | undefined;
}
