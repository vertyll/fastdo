import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { findRootPath } from '../../common/utils/root-path.utils';
import { FILE_CONSTANTS } from '../constants/file.constants';
import { StorageType } from '../enums/storage-type.enum';
import { IFileConfig } from '../interfaces/file-config.interface';

@Injectable()
export class FileConfigService {
  private readonly rootPath: string;

  constructor(private configService: ConfigService) {
    this.rootPath = findRootPath();
  }

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
    const uploadDir = this.configService.get<string>('app.file.storage.local.uploadDir');
    const basePath = join(this.rootPath, uploadDir || FILE_CONSTANTS.UPLOAD_PATH);

    return {
      uploadDir: basePath,
    };
  }

  private getMaxFileSize(): number {
    const maxSize = this.configService.get<string>('app.file.validation.maxSize');
    return maxSize ? parseInt(maxSize, 10) : FILE_CONSTANTS.MAX_FILE_SIZE;
  }

  private getAllowedMimeTypes(): string[] {
    const mimeTypes = this.configService.get<string>('app.file.validation.allowedMimeTypes');
    return mimeTypes?.split(',') || FILE_CONSTANTS.ALLOWED_MIME_TYPES;
  }
}
