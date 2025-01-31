import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../../../roles/entities/role.entity';
import {
  PrivacyPolicySectionTranslation,
} from '../../../../terms-and-policies/entities/privacy-policy-section-translation.entity';
import { PrivacyPolicySection } from '../../../../terms-and-policies/entities/privacy-policy-section.entity';
import { PrivacyPolicy } from '../../../../terms-and-policies/entities/privacy-policy.entity';
import { TermsSectionTranslation } from '../../../../terms-and-policies/entities/terms-section-translation.entity';
import { TermsSection } from '../../../../terms-and-policies/entities/terms-section.entity';
import { Terms } from '../../../../terms-and-policies/entities/terms.entity';
import { UserRole } from '../../../../users/entities/user-role.entity';
import { User } from '../../../../users/entities/user.entity';
import appConfig from '../../../config/app.config';
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
      TermsSection,
      TermsSectionTranslation,
      PrivacyPolicy,
      PrivacyPolicySection,
      PrivacyPolicySectionTranslation,
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
