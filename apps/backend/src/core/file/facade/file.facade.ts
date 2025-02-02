import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { FileMetadataDto } from '../dtos/file-metadata.dto';
import { File } from '../entities/file.entity';
import { FileService } from '../services/file.service';
import { FileUploadOptions } from '../interfaces/file-upload-options.interface';

@Injectable()
export class FileFacade {
  constructor(private readonly fileService: FileService) {}

  async upload(file: MultipartFile, options?: FileUploadOptions): Promise<FileMetadataDto> {
    return this.fileService.uploadFile(file, options);
  }

  async delete(fileId: string): Promise<void> {
    return this.fileService.deleteFile(fileId);
  }

  async get(fileId: string): Promise<File> {
    return this.fileService.getFile(fileId);
  }
}
