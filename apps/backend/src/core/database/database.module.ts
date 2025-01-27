import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DatabaseConfig, DatabaseType, Environment } from '../config/types/app.config.type';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DatabaseConfig => ({
        type: configService.getOrThrow<DatabaseType>('app.database.type'),
        host: configService.getOrThrow<string>('app.database.host'),
        port: configService.getOrThrow<number>('app.database.port'),
        username: configService.getOrThrow<string>('app.database.username'),
        password: configService.getOrThrow<string>('app.database.password'),
        database: configService.getOrThrow<string>('app.database.database'),
        migrations: configService.get<string[]>('app.database.migrations'),
        migrationsTableName: configService.get<string>('app.database.migrationsTableName'),
        ssl: configService.get('app.database.ssl'),
        autoLoadEntities: true,
        synchronize: configService.get('app.environment') === Environment.DEVELOPMENT,
        namingStrategy: new SnakeNamingStrategy(),
        logging: configService.get('app.environment') === Environment.DEVELOPMENT,
        logger: configService.get('app.environment') === Environment.DEVELOPMENT ? 'advanced-console' : undefined,
        retryAttempts: configService.get<number>('app.database.retryAttempts'),
        retryDelay: configService.get<number>('app.database.retryDelay'),
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
