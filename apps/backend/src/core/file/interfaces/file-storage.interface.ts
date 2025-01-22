import { MultipartFile } from '@fastify/multipart';
import { FileMetadata } from './file-metadata.interface';
import { FileUploadOptions } from './file-upload-options.interface';

export interface FileStorage {
  uploadFile(file: MultipartFile, options?: FileUploadOptions): Promise<FileMetadata>;
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): Promise<string>;
}
