import { ClsStore } from 'nestjs-cls';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum StorageType {
  LOCAL = 'local',
}

export enum DatabaseType {
  POSTGRES = 'postgres',
}

export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ],
  UPLOAD_DIR_PATH: './uploads',
};

export type DatabaseConfig = PostgresConnectionOptions & {
  autoLoadEntities?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
};

interface SecurityConfig {
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
    confirmationToken: {
      expiresIn: string;
      secret: string;
    };
  };
  bcryptSaltRounds: number;
  rateLimiting: {
    windowMs: number;
    max: number;
  };
}

export interface OpenApiConfig {
  title: string;
  description: string;
  version: string;
  path: string;
}

interface FrontendConfig {
  url: string;
  paths: {
    confirmEmail: string;
    resetPassword: string;
  };
}

export interface MailConfig {
  host: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
  templatesPath: string;
  dev: {
    host: string;
    port: number;
  };
}

interface FileConfig {
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

interface ApiConfig {
  keys: {
    apiKey: string;
  };
}

interface LanguageConfig {
  fallbackLanguage: string;
  languageDirPath: string;
  typesOutputPath: string;
}

export interface AppConfig {
  environment: Environment;
  port: number;
  appName: string;
  appUrl: string;
  language: LanguageConfig;
  database: DatabaseConfig;
  api: ApiConfig;
  security: SecurityConfig;
  openApi: OpenApiConfig;
  frontend: FrontendConfig;
  mail: MailConfig;
  file: FileConfig;
}

export interface UserContext {
  userId: number;
  userEmail: string;
  userRoles: string[];
}

export interface CustomClsStore extends ClsStore {
  user: UserContext;
}
