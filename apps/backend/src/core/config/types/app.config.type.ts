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
  UPLOAD_PATH: './uploads',
};

export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  autoLoadEntities?: boolean;
  synchronize?: boolean;
  namingStrategy?: any;
}

interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    confirmationToken: {
      expiresIn: string;
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
  appUrl: string;
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
      uploadDir: string;
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

export interface AppConfig {
  environment: Environment;
  port: number;
  database: DatabaseConfig;
  api: ApiConfig;
  security: SecurityConfig;
  openApi: OpenApiConfig;
  frontend: FrontendConfig;
  mail: MailConfig;
  file: FileConfig;
}
