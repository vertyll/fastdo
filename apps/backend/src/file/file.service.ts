import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { File } from './entities/file.entity';
import { FileDeleteException } from './exceptions/file-delete.exception';
import { FileNotFoundException } from './exceptions/file-not-found.exception';
import { FileUploadException } from './exceptions/file-upload.exception';
import { FileMetadata } from './interfaces/file-metadata.interface';
import { FileUploadOptions } from './interfaces/file-upload-options.interface';
import { FileRepository } from './repositories/file.repository';
import { StorageStrategy } from './storage/storage-strategy';
import { FileValidator } from './validators/file-validator';

@Injectable()
export class FileService {
  constructor(
    private readonly storageStrategy: StorageStrategy,
    private readonly fileValidator: FileValidator,
    private readonly fileRepository: FileRepository,
  ) {}

  async uploadFile(
    file: MultipartFile,
    options?: FileUploadOptions,
  ): Promise<FileMetadata> {
    try {
      await this.fileValidator.validate(file, options);

      const storage = this.storageStrategy.getStorage();

      const uploadedFile = await storage.uploadFile(file, options);

      const url = await storage.getFileUrl(uploadedFile.path);

      const savedFile = await this.fileRepository.save({
        ...uploadedFile,
        url,
      });

      return {
        ...uploadedFile,
        id: savedFile.id,
        url,
      };
    } catch (error) {
      if (error instanceof FileNotFoundException || error instanceof FileUploadException) {
        throw error;
      }
      throw new FileUploadException('Failed to process file upload', error);
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new FileNotFoundException(fileId);
    }

    try {
      const storage = this.storageStrategy.getStorage(file.storageType);
      await storage.deleteFile(file.path);
      await this.fileRepository.delete(fileId);
    } catch (error) {
      throw new FileDeleteException('Failed to delete file', error);
    }
  }

  async getFile(fileId: string): Promise<File> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new FileNotFoundException(fileId);
    }
    return file;
  }
}
