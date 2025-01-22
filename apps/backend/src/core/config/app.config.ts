import { registerAs } from '@nestjs/config';
import { AppConfig, DatabaseType, Environment, FILE_CONSTANTS, StorageType } from './types/app.config.type';

export default registerAs('app', (): AppConfig => ({
  environment: (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT,
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    type: (process.env.DATABASE_TYPE as DatabaseType) || DatabaseType.POSTGRES,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'postgres',
  },
  api: {
    keys: {
      apiKey: process.env.API_KEY || 'development-api-key',
    },
  },
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'development-secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '90d',
      confirmationToken: {
        expiresIn: process.env.JWT_CONFIRMATION_TOKEN_EXPIRES_IN || '24h',
      },
    },
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    rateLimiting: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
  },
  openApi: {
    title: process.env.OPENAPI_TITLE || 'fastdo',
    description: process.env.OPENAPI_DESCRIPTION || 'todo list api',
    version: process.env.OPENAPI_VERSION || '1.0',
    path: process.env.OPENAPI_PATH || 'api',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:4200',
    paths: {
      confirmEmail: '/auth/confirm-email',
      resetPassword: '/auth/reset-password',
    },
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM || 'noreply@example.com',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    dev: {
      host: 'localhost',
      port: 1025,
    },
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
