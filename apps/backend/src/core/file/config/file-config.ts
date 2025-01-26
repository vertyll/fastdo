import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { FILE_CONSTANTS, StorageType } from '../../config/types/app.config.type';
import { IFileConfig } from '../interfaces/file-config.interface';

@Injectable()
export class FileConfigService {
  constructor(
    private configService: ConfigService,
  ) {}

  getConfig(): IFileConfig {
    return {
      storage: {
        type: this.getStorageType(),
        local: this.getLocalConfig(),
      },
      validation: {
        maxSize: this.getMaxFileSize(),
        allowedMimeTypes: this.getAllowedMimeTypes(),
      },
    };
  }

  private getStorageType(): StorageType {
    const storageType = this.configService.get<string>('app.file.storage.type');
    return storageType as StorageType || StorageType.LOCAL;
  }

  private getLocalConfig() {
    const uploadDirPath = this.configService.getOrThrow<string>('app.file.storage.local.uploadDirPath');
    return {
      uploadDirPath: join(process.cwd(), uploadDirPath),
    };
  }

  private getMaxFileSize(): number {
    const maxSize = this.configService.get<string | number>('app.file.validation.maxSize');
    if (typeof maxSize === 'number') {
      return maxSize;
    }
    return maxSize ? parseInt(maxSize, 10) : FILE_CONSTANTS.MAX_FILE_SIZE;
  }

  private getAllowedMimeTypes(): string[] {
    const mimeTypes = this.configService.get<string | string[]>('app.file.validation.allowedMimeTypes');

    if (Array.isArray(mimeTypes)) {
      return mimeTypes;
    }

    if (typeof mimeTypes === 'string' && mimeTypes.length > 0) {
      return mimeTypes.split(',').map(type => type.trim());
    }

    return FILE_CONSTANTS.ALLOWED_MIME_TYPES;
  }
}
