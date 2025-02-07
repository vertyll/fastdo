import { registerAs } from '@nestjs/config';
import * as process from 'node:process';
import { AppConfig, DatabaseType, Environment, FILE_CONSTANTS, StorageType } from './types/app.config.type';

export default registerAs('app', (): AppConfig => ({
  environment: (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT,
  port: parseInt(process.env.PORT || '3000', 10),
  appName: process.env.APP_NAME || 'nestjs-app',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  prefix: process.env.API_PREFIX || 'api',
  excludedPrefixPaths: process.env.API_EXCLUDED_PREFIX_PATHS?.split(',') || ['/', '/uploads'],
  language: {
    fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',
    languageDirPath: process.env.LANGUAGE_DIR_PATH || 'src/i18n/',
    typesOutputPath: process.env.LANGUAGE_TYPES_OUTPUT_PATH || 'src/generated/i18n/i18n.generated.ts',
  },
  database: {
    type: (process.env.DATABASE_TYPE as DatabaseType) || DatabaseType.POSTGRES,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'postgres',
    migrations: [(process.env.DATABASE_MIGRATIONS_DIR || './migrations') + '/*.{ts,js}'],
    migrationsTableName: process.env.DATABASE_MIGRATIONS_TABLE_NAME || 'migrations',
    ssl: process.env.DATABASE_SSL === 'true' || false,
    retryAttempts: parseInt(process.env.DATABASE_RETRY_ATTEMPTS || '10'),
    retryDelay: parseInt(process.env.DATABASE_RETRY_DELAY || '3000'),
  },
  api: {
    keys: {
      apiKey: process.env.API_KEY || 'development-api-key',
    },
  },
  security: {
    jwt: {
      accessToken: {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'development-secret',
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
      },
      refreshToken: {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'development-refresh-secret',
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
      },
      confirmationToken: {
        secret: process.env.JWT_CONFIRMATION_TOKEN_SECRET || 'development-confirmation-secret',
        expiresIn: process.env.JWT_CONFIRMATION_TOKEN_EXPIRES_IN || '24h',
      },
    },
    cookie: {
      refreshToken: {
        httpOnly: process.env.COOKIE_HTTP_ONLY === 'true' || true,
        secure: process.env.COOKIE_SECURE === 'true' || false,
        sameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax',
        path: process.env.COOKIE_PATH || '/api/auth',
        maxAge: parseInt(process.env.COOKIE_MAX_AGE || String(7 * 24 * 60 * 60 * 1000)),
        domain: process.env.COOKIE_DOMAIN || undefined,
      },
    },
    cors: {
      credentials: process.env.CORS_CREDENTIALS === 'true' || true,
      methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(',')
        || ['Content-Type', 'Authorization', 'x-api-key', 'x-lang'],
    },
    helmet: {
      crossOriginPolicy: process.env.HELMET_CROSS_ORIGIN_POLICY || 'cross-origin',
      contentSecurityPolicy: process.env.HELMET_CSP_ENABLED === 'true' || false,
    },
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    rateLimiting: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
  },
  openApi: {
    title: process.env.OPENAPI_TITLE || 'nestjs-app',
    description: process.env.OPENAPI_DESCRIPTION || 'nestjs-app API documentation',
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
    templatesPath: process.env.MAIL_TEMPLATES_PATH || 'src/core/mail/templates',
    from: process.env.MAIL_FROM || 'noreply@example.com',
    dev: {
      host: 'localhost',
      port: 1025,
    },
  },
  file: {
    storage: {
      type: (process.env.STORAGE_TYPE as StorageType) || StorageType.LOCAL,
      local: {
        uploadDirPath: process.env.UPLOAD_DIR_PATH || FILE_CONSTANTS.UPLOAD_DIR_PATH,
      },
    },
    validation: {
      maxSize: parseInt(process.env.MAX_FILE_SIZE || '') || FILE_CONSTANTS.MAX_FILE_SIZE,
      allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || FILE_CONSTANTS.ALLOWED_MIME_TYPES,
    },
  },
}));
