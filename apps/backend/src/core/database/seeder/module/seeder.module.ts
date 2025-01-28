import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../../../roles/entities/role.entity';
import { UserRole } from '../../../../users/entities/user-role.entity';
import { User } from '../../../../users/entities/user.entity';
import appConfig from '../../../config/app.config';
import { DatabaseModule } from '../../database.module';
import { RoleSeeder } from '../implementations/role.seeder';
import { SeederErrorHandler } from '../services/error-handler.service';
import { SeederFactoryService } from '../services/seeder-factory.service';
import { SeederLogger } from '../services/seeder-logger.service';
import { SeederRunnerService } from '../services/seeder-runner.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Role, UserRole, User]),
  ],
  providers: [
    SeederRunnerService,
    SeederLogger,
    SeederErrorHandler,
    RoleSeeder,
    SeederFactoryService,
  ],
  exports: [SeederRunnerService],
})
export class SeederModule {}
