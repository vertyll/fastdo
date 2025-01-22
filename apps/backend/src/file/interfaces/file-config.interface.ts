import { StorageType } from 'src/config/types/app.config.type';

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
