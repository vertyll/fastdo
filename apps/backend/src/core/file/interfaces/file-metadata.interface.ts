import { StorageType } from 'src/core/config/types/app.config.type';

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
