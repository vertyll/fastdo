import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

config();

const dataSourceOptions: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'postgres',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: [(process.env.DATABASE_MIGRATIONS_DIR || './migrations') + '/*.{ts,js}'],
  migrationsTableName: process.env.DATABASE_MIGRATIONS_TABLE_NAME || 'migrations',
  ssl: process.env.DATABASE_SSL === 'true',
  namingStrategy: new SnakeNamingStrategy(),
  logging: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development' ? 'advanced-console' : undefined,
};

export default new DataSource(dataSourceOptions);
