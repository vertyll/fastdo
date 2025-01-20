import { registerAs } from '@nestjs/config';
import { FILE_CONSTANTS } from '../file/constants/file.constants';
import { StorageType } from '../file/enums/storage-type.enum';

export default registerAs('app', () => ({
  environment: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  mail: {
    from: process.env.MAIL_FROM || 'noreply@example.com',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:4200',
  },
  file: {
    storage: {
      type: (process.env.STORAGE_TYPE as StorageType) || StorageType.LOCAL,
      local: {
        uploadDir: process.env.UPLOAD_DIR || FILE_CONSTANTS.UPLOAD_PATH,
      },
    },
    validation: {
      maxSize: parseInt(process.env.MAX_FILE_SIZE || '') || FILE_CONSTANTS.MAX_FILE_SIZE,
      allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || FILE_CONSTANTS.ALLOWED_MIME_TYPES,
    },
  },
}));
