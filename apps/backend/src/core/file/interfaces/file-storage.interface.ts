import { MultipartFile } from '@fastify/multipart';
import { FileMetadataDto } from '../dtos/file-metadata.dto';
import { FileUploadOptions } from '../types/file-upload-options.interface';

export interface FileStorage {
  uploadFile(file: MultipartFile, options?: FileUploadOptions): Promise<FileMetadataDto>;
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): Promise<string>;
}
