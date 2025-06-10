import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { FileMetadataDto } from '../dtos/file-metadata.dto';
import { File } from '../entities/file.entity';
import { FileService } from '../services/file.service';
import { FileUploadOptions } from '../types/file-upload-options.interface';

@Injectable()
export class FileFacade {
  constructor(private readonly fileService: FileService) {}

  public async upload(file: MultipartFile, options?: FileUploadOptions): Promise<FileMetadataDto> {
    return this.fileService.uploadFile(file, options);
  }

  public async delete(fileId: string): Promise<void> {
    return this.fileService.deleteFile(fileId);
  }

  public async get(fileId: string): Promise<File> {
    return this.fileService.getFile(fileId);
  }
}
