import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DatabaseConfig, DatabaseType } from '../config/types/app.config.type';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DatabaseConfig => ({
        type: configService.getOrThrow<DatabaseType>('app.database.type'),
        host: configService.getOrThrow<string>('app.database.host'),
        port: configService.getOrThrow<number>('app.database.port'),
        username: configService.getOrThrow<string>('app.database.username'),
        password: configService.getOrThrow<string>('app.database.password'),
        database: configService.getOrThrow<string>('app.database.database'),
        autoLoadEntities: true,
        synchronize: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
