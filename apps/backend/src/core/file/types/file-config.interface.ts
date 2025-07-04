import { StorageType } from '../../config/types/app.config.type';

export interface FileConfig {
  storage: {
    type: StorageType;
    local: {
      uploadDirPath: string;
    };
  };
  validation: {
    maxSize: number;
    allowedMimeTypes: string[];
  };
}
