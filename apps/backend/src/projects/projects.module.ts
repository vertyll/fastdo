import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/notifications/entities/notification.entity';
import { File } from '../core/file/entities/file.entity';
import { FileModule } from '../core/file/file.module';
import { Language } from '../core/language/entities/language.entity';
import { NotificationModule } from '../notifications/notification.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { ProjectCategoriesController } from './controllers/project-categories.controller';
import { ProjectRolesController } from './controllers/project-roles.controller';
import { ProjectStatusesController } from './controllers/project-statuses.controller';
import { ProjectTypesController } from './controllers/project-types.controller';
import { ProjectUserRolesController } from './controllers/project-user-roles.controller';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectCategoryTranslation } from './entities/project-category-translation.entity';
import { ProjectCategory } from './entities/project-category.entity';
import { ProjectInvitation } from './entities/project-invitation.entity';
import { ProjectRolePermissionTranslation } from './entities/project-role-permission-translation.entity';
import { ProjectRolePermission } from './entities/project-role-permission.entity';
import { ProjectRoleTranslation } from './entities/project-role-translation.entity';
import { ProjectRole } from './entities/project-role.entity';
import { ProjectStatusTranslation } from './entities/project-status-translation.entity';
import { ProjectStatus } from './entities/project-status.entity';
import { ProjectTypeTranslation } from './entities/project-type-translation.entity';
import { ProjectType } from './entities/project-type.entity';
import { ProjectUserRole } from './entities/project-user-role.entity';
import { Project } from './entities/project.entity';
import { ProjectCategoryRepository } from './repositories/project-category.repository';
import { ProjectInvitationRepository } from './repositories/project-invitation.repository';
import { ProjectRoleRepository } from './repositories/project-role.repository';
import { ProjectStatusRepository } from './repositories/project-status.repository';
import { ProjectTypeRepository } from './repositories/project-type.repository';
import { ProjectUserRoleRepository } from './repositories/project-user-role.repository';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectCategoriesService } from './services/project-categories.service';
import { ProjectRolesService } from './services/project-roles.service';
import { ProjectStatusesService } from './services/project-statuses.service';
import { ProjectTypesService } from './services/project-types.service';
import { ProjectUserRolesService } from './services/project-user-roles.service';
import { ProjectManagementService } from './services/projects-managment.service';
import { ProjectsService } from './services/projects.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectUserRole,
      ProjectRole,
      ProjectCategory,
      ProjectType,
      ProjectStatus,
      ProjectStatusTranslation,
      ProjectUserRole,
      File,
      Language,
      ProjectRole,
      ProjectRoleTranslation,
      ProjectCategoryTranslation,
      ProjectTypeTranslation,
      ProjectInvitation,
      ProjectRolePermission,
      ProjectRolePermissionTranslation,
      Notification,
    ]),
    TasksModule,
    FileModule,
    NotificationModule,
    UsersModule,
  ],
  controllers: [
    ProjectsController,
    ProjectRolesController,
    ProjectTypesController,
    ProjectUserRolesController,
    ProjectCategoriesController,
    ProjectStatusesController,
  ],
  providers: [
    ProjectsService,
    ProjectManagementService,
    ProjectRepository,
    ProjectRolesService,
    ProjectRoleRepository,
    ProjectTypesService,
    ProjectTypeRepository,
    ProjectCategoriesService,
    ProjectCategoryRepository,
    ProjectStatusesService,
    ProjectStatusRepository,
    ProjectUserRolesService,
    ProjectUserRoleRepository,
    ProjectInvitationRepository,
  ],
})
export class ProjectsModule {}
