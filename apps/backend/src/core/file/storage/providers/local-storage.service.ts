import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { ensureDir, unlink, writeFile } from 'fs-extra';
import { I18nService } from 'nestjs-i18n';
import { join } from 'path';
import { I18nTranslations } from '../../../../generated/i18n/i18n.generated';
import { StorageType } from '../../../config/types/app.config.type';
import { FileConfigService } from '../../config/file-config';
import { FileMetadataDto } from '../../dtos/file-metadata.dto';
import { FileDeleteException } from '../../exceptions/file-delete.exception';
import { FileNotFoundException } from '../../exceptions/file-not-found.exception';
import { FileUploadException } from '../../exceptions/file-upload.exception';
import { FileStorage } from '../../interfaces/file-storage.interface';
import { FileUploadOptions } from '../../types/file-upload-options.interface';
import { FilePathBuilder } from '../file-path.builder';

@Injectable()
export class LocalStorageService implements FileStorage {
  constructor(
    private readonly fileConfigService: FileConfigService,
    private readonly filePathBuilder: FilePathBuilder,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async uploadFile(
    file: MultipartFile,
    options?: FileUploadOptions,
  ): Promise<FileMetadataDto> {
    try {
      const config = this.fileConfigService.getConfig();
      const uploadDirPath = config.storage.local.uploadDirPath;
      const path = this.filePathBuilder.buildPath(file.filename, options?.path);
      const fullPath = join(uploadDirPath, path);
      const directory = join(uploadDirPath, path.split('/').slice(0, -1).join('/'));

      await ensureDir(directory);

      const buffer = await file.toBuffer();
      await writeFile(fullPath, buffer);

      const fileName = path.split('/').pop();
      if (!fileName) {
        return Promise.reject(
          new FileUploadException(
            this.i18n,
            this.i18n.t('messages.File.errors.failedExtractFileNameFromPath'),
          ),
        );
      }

      return {
        filename: fileName,
        originalName: file.filename,
        path,
        mimetype: file.mimetype || 'application/octet-stream',
        size: buffer.length,
        encoding: file.encoding || 'utf-8',
        metadata: options?.metadata || {},
        storageType: StorageType.LOCAL,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new FileUploadException(
        this.i18n,
        this.i18n.t('messages.File.errors.filedUploadFileToLocalStorage'),
        error instanceof Error ? error : undefined,
      );
    }
  }

  public async deleteFile(path: string): Promise<void> {
    try {
      const config = this.fileConfigService.getConfig();
      const fullPath = join(config.storage.local.uploadDirPath, path);
      await unlink(fullPath);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new FileNotFoundException(
          this.i18n,
          path,
        );
      }
      throw new FileDeleteException(
        this.i18n,
        this.i18n.t('messages.File.errors.fileNotDeleted'),
        error instanceof Error ? error : undefined,
      );
    }
  }

  public async getFileUrl(path: string): Promise<string> {
    const config = this.fileConfigService.getConfig();
    return `${config.storage.local.uploadDirPath}/${path}`;
  }
}
