import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../../../../auth/entities/refresh-token.entity';
import { ProjectCategoryTranslation } from '../../../../projects/entities/project-category-translation.entity';
import { ProjectCategory } from '../../../../projects/entities/project-category.entity';
import { ProjectRoleTranslation } from '../../../../projects/entities/project-role-translation.entity';
import { ProjectRole } from '../../../../projects/entities/project-role.entity';
import { ProjectStatusTranslation } from '../../../../projects/entities/project-status-translation.entity';
import { ProjectStatus } from '../../../../projects/entities/project-status.entity';
import { ProjectTypeTranslation } from '../../../../projects/entities/project-type-translation.entity';
import { ProjectType } from '../../../../projects/entities/project-type.entity';
import { ProjectUserRole } from '../../../../projects/entities/project-user-role.entity';
import { ProjectUser } from '../../../../projects/entities/project-user.entity';
import { Project } from '../../../../projects/entities/project.entity';
import { RoleTranslation } from '../../../../roles/entities/role-translation.entity';
import { Role } from '../../../../roles/entities/role.entity';
import { PriorityTranslation } from '../../../../tasks/entities/priority-translation.entity';
import { Priority } from '../../../../tasks/entities/priority.entity';
import { TaskAttachment } from '../../../../tasks/entities/task-attachment.entity';
import { TaskCommentAttachment } from '../../../../tasks/entities/task-comment-attachment.entity';
import { TaskComment } from '../../../../tasks/entities/task-comment.entity';
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
import { Language } from '../../../language/entities/language.entity';
import { DatabaseModule } from '../../database.module';
import { LanguageSeeder } from '../implementations/language.seeder';
import { LegalDocumentsSeeder } from '../implementations/legal-documents.seeder';
import { PrioritySeeder } from '../implementations/priority.seeder';
import { ProjectRoleSeeder } from '../implementations/project-role.seeder';
import { ProjectTypeSeeder } from '../implementations/project-type.seeder';
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
      RoleTranslation,
      UserRole,
      User,
      Terms,
      File,
      Language,
      TermsSection,
      TermsSectionTranslation,
      PrivacyPolicy,
      PrivacyPolicySection,
      PrivacyPolicySectionTranslation,
      Project,
      ProjectUser,
      ProjectRole,
      ProjectRoleTranslation,
      ProjectType,
      ProjectTypeTranslation,
      ProjectCategory,
      ProjectCategoryTranslation,
      ProjectStatus,
      ProjectStatusTranslation,
      ProjectUserRole,
      Task,
      TaskAttachment,
      TaskComment,
      TaskCommentAttachment,
      Priority,
      PriorityTranslation,
      RefreshToken,
      UserEmailHistory,
    ]),
  ],
  providers: [
    SeederRunnerService,
    SeederLogger,
    SeederErrorHandler,
    LanguageSeeder,
    RoleSeeder,
    PrioritySeeder,
    ProjectRoleSeeder,
    ProjectTypeSeeder,
    LegalDocumentsSeeder,
    SeederFactoryService,
  ],
  exports: [SeederRunnerService],
})
export class SeederModule {}
