import { StorageTypeEnum } from '../../config/types/app.config.type';

export interface FileConfig {
  storage: {
    type: StorageTypeEnum;
    local: {
      uploadDirPath: string;
    };
  };
  validation: {
    maxSize: number;
    allowedMimeTypes: string[];
  };
}
