import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../../../../auth/entities/refresh-token.entity';
import { ProjectUser } from '../../../../projects/entities/project-user.entity';
import { Project } from '../../../../projects/entities/project.entity';
import { Role } from '../../../../roles/entities/role.entity';
import { Priority } from '../../../../tasks/entities/priority.entity';
import { Task } from '../../../../tasks/entities/task.entity';
import {
  PrivacyPolicySectionTranslation,
} from '../../../../terms-and-policies/entities/privacy-policy-section-translation.entity';
import { PrivacyPolicySection } from '../../../../terms-and-policies/entities/privacy-policy-section.entity';
import { PrivacyPolicy } from '../../../../terms-and-policies/entities/privacy-policy.entity';
import { TermsSectionTranslation } from '../../../../terms-and-policies/entities/terms-section-translation.entity';
import { TermsSection } from '../../../../terms-and-policies/entities/terms-section.entity';
import { Terms } from '../../../../terms-and-policies/entities/terms.entity';
import { UserEmailHistory } from '../../../../users/entities/user-email-history.entity';
import { UserRole } from '../../../../users/entities/user-role.entity';
import { User } from '../../../../users/entities/user.entity';
import appConfig from '../../../config/app.config';
import { File } from '../../../file/entities/file.entity';
import { DatabaseModule } from '../../database.module';
import { LegalDocumentsSeeder } from '../implementations/legal-documents.seeder';
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
    TypeOrmModule.forFeature([
      Role,
      UserRole,
      User,
      Terms,
      File,
      TermsSection,
      TermsSectionTranslation,
      PrivacyPolicy,
      PrivacyPolicySection,
      PrivacyPolicySectionTranslation,
      ProjectUser,
      Project,
      Task,
      Priority,
      RefreshToken,
      UserEmailHistory,
    ]),
  ],
  providers: [
    SeederRunnerService,
    SeederLogger,
    SeederErrorHandler,
    RoleSeeder,
    LegalDocumentsSeeder,
    SeederFactoryService,
  ],
  exports: [SeederRunnerService],
})
export class SeederModule {}
