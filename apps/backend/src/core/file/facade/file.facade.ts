import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { File } from '../entities/file.entity';
import { FileService } from '../file.service';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { FileUploadOptions } from '../interfaces/file-upload-options.interface';

@Injectable()
export class FileFacade {
  constructor(private readonly fileService: FileService) {}

  async upload(file: MultipartFile, options?: FileUploadOptions): Promise<FileMetadata> {
    return this.fileService.uploadFile(file, options);
  }

  async delete(fileId: string): Promise<void> {
    return this.fileService.deleteFile(fileId);
  }

  async get(fileId: string): Promise<File> {
    return this.fileService.getFile(fileId);
  }
}
