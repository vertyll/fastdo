import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FILE_CONSTANTS, FileStorageLocal, StorageType } from '../../config/types/app.config.type';
import { FileConfig } from '../types/file-config.interface';

@Injectable()
export class FileConfigService {
  constructor(
    private configService: ConfigService,
  ) {}

  public getConfig(): FileConfig {
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

  private getLocalConfig(): FileStorageLocal {
    const uploadDirPath = this.configService.getOrThrow<string>('app.file.storage.local.uploadDirPath');
    return {
      uploadDirPath,
    };
  }

  private getMaxFileSize(): number {
    const maxSize = this.configService.get<string | number>('app.file.validation.maxSize');
    if (typeof maxSize === 'number') return maxSize;

    return maxSize ? parseInt(maxSize, 10) : FILE_CONSTANTS.MAX_FILE_SIZE;
  }

  private getAllowedMimeTypes(): string[] {
    const mimeTypes = this.configService.get<string | string[]>('app.file.validation.allowedMimeTypes');

    if (Array.isArray(mimeTypes)) return mimeTypes;

    if (typeof mimeTypes === 'string' && mimeTypes.length > 0) return mimeTypes.split(',').map(type => type.trim());

    return FILE_CONSTANTS.ALLOWED_MIME_TYPES;
  }
}
