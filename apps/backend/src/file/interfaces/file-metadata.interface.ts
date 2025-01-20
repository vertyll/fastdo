import { StorageType } from '../enums/storage-type.enum';

export interface FileMetadata {
  id?: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  encoding: string;
  url?: string | null;
  storageType: StorageType;
  metadata?: Record<string, any>;
}
