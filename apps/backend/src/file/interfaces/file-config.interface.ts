import { StorageType } from '../enums/storage-type.enum';

export interface IFileConfig {
  storage: {
    type: StorageType;
    local: {
      uploadDir: string;
    };
  };
  validation: {
    maxSize: number;
    allowedMimeTypes: string[];
  };
}
