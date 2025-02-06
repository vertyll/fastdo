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

interface JwtTokenConfig {
  secret: string;
  expiresIn: string;
}

interface JwtConfig {
  accessToken: JwtTokenConfig;
  refreshToken: JwtTokenConfig;
  confirmationToken: JwtTokenConfig;
}

export interface RefreshTokenCookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
  domain?: string;
}

interface CookieConfig {
  refreshToken: RefreshTokenCookieConfig;
}

interface RateLimitingConfig {
  windowMs: number;
  max: number;
}

export interface SecurityConfig {
  jwt: JwtConfig;
  cookie: CookieConfig;
  bcryptSaltRounds: number;
  rateLimiting: RateLimitingConfig;
}

export interface OpenApiConfig {
  title: string;
  description: string;
  version: string;
  path: string;
}

interface FrontendPaths {
  confirmEmail: string;
  resetPassword: string;
}

interface FrontendConfig {
  url: string;
  paths: FrontendPaths;
}

interface MailDevConfig {
  host: string;
  port: number;
}

export interface MailConfig {
  host: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
  templatesPath: string;
  dev: MailDevConfig;
}

interface FileStorageLocal {
  uploadDirPath: string;
}

interface FileStorage {
  type: StorageType;
  local: FileStorageLocal;
}

interface FileValidation {
  maxSize: number;
  allowedMimeTypes: string[];
}

interface FileConfig {
  storage: FileStorage;
  validation: FileValidation;
}

interface ApiKeys {
  apiKey: string;
}

interface ApiConfig {
  keys: ApiKeys;
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
