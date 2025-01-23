import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { ensureDir, unlink, writeFile } from 'fs-extra';
import { join } from 'path';
import { StorageType } from '../../../config/types/app.config.type';
import { FileConfigService } from '../../config/file-config';
import { FileMetadataDto } from '../../dtos/file-metadata.dto';
import { FileDeleteException } from '../../exceptions/file-delete.exception';
import { FileNotFoundException } from '../../exceptions/file-not-found.exception';
import { FileUploadException } from '../../exceptions/file-upload.exception';
import { FileStorage } from '../../interfaces/file-storage.interface';
import { FileUploadOptions } from '../../interfaces/file-upload-options.interface';
import { FilePathBuilder } from '../file-path.builder';

@Injectable()
export class LocalStorageService implements FileStorage {
  constructor(
    private readonly fileConfigService: FileConfigService,
    private readonly filePathBuilder: FilePathBuilder,
  ) {}

  async uploadFile(
    file: MultipartFile,
    options?: FileUploadOptions,
  ): Promise<FileMetadataDto> {
    try {
      const config = this.fileConfigService.getConfig();
      const uploadDir = config.storage.local.uploadDir;
      const path = this.filePathBuilder.buildPath(file.filename, options?.path);
      const fullPath = join(uploadDir, path);
      const directory = join(uploadDir, path.split('/').slice(0, -1).join('/'));

      await ensureDir(directory);

      const buffer = await file.toBuffer();
      await writeFile(fullPath, buffer);

      const fileName = path.split('/').pop();
      if (!fileName) {
        return Promise.reject(
          new FileUploadException('Failed to extract file name from path'),
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
        'Failed to upload file to local storage',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const config = this.fileConfigService.getConfig();
      const fullPath = join(config.storage.local.uploadDir, path);
      await unlink(fullPath);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new FileNotFoundException(path);
      }
      throw new FileDeleteException(
        'Failed to delete file',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async getFileUrl(path: string): Promise<string> {
    const config = this.fileConfigService.getConfig();
    return `${config.storage.local.uploadDir}/${path}`;
  }
}
