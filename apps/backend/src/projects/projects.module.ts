import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '../core/file/entities/file.entity';
import { FileModule } from '../core/file/file.module';
import { Language } from '../core/language/entities/language.entity';
import { NotificationModule } from '../notifications/notification.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { ProjectCategoryController } from './controllers/project-category.controller';
import { ProjectRoleController } from './controllers/project-role.controller';
import { ProjectStatusController } from './controllers/project-status.controller';
import { ProjectTypeController } from './controllers/project-type.controller';
import { ProjectUserRoleController } from './controllers/project-user-role.controller';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectCategoryTranslation } from './entities/project-category-translation.entity';
import { ProjectCategory } from './entities/project-category.entity';
import { ProjectRoleTranslation } from './entities/project-role-translation.entity';
import { ProjectRole } from './entities/project-role.entity';
import { ProjectStatusTranslation } from './entities/project-status-translation.entity';
import { ProjectStatus } from './entities/project-status.entity';
import { ProjectTypeTranslation } from './entities/project-type-translation.entity';
import { ProjectType } from './entities/project-type.entity';
import { ProjectUserRole } from './entities/project-user-role.entity';
import { ProjectUser } from './entities/project-user.entity';
import { Project } from './entities/project.entity';
import { ProjectCategoryRepository } from './repositories/project-category.repository';
import { ProjectRoleRepository } from './repositories/project-role.repository';
import { ProjectStatusRepository } from './repositories/project-status.repository';
import { ProjectTypeRepository } from './repositories/project-type.repository';
import { ProjectUserRoleRepository } from './repositories/project-user-role.repository';
import { ProjectUserRepository } from './repositories/project-user.repository';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectCategoryService } from './services/project-category.service';
import { ProjectRoleService } from './services/project-role.service';
import { ProjectStatusService } from './services/project-status.service';
import { ProjectTypeService } from './services/project-type.service';
import { ProjectUserRoleService } from './services/project-user-role.service';
import { ProjectManagementService } from './services/projects-managment.service';
import { ProjectsService } from './services/projects.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectUser,
      ProjectType,
      ProjectTypeTranslation,
      ProjectCategory,
      ProjectCategoryTranslation,
      ProjectStatus,
      ProjectStatusTranslation,
      ProjectUserRole,
      File,
      Language,
      ProjectRole,
      ProjectRoleTranslation,
    ]),
    TasksModule,
    FileModule,
    NotificationModule,
    UsersModule,
  ],
  controllers: [
    ProjectsController,
    ProjectRoleController,
    ProjectTypeController,
    ProjectUserRoleController,
    ProjectCategoryController,
    ProjectStatusController,
  ],
  providers: [
    ProjectsService,
    ProjectManagementService,
    ProjectRepository,
    ProjectUserRepository,
    ProjectRoleService,
    ProjectRoleRepository,
    ProjectTypeService,
    ProjectTypeRepository,
    ProjectCategoryService,
    ProjectCategoryRepository,
    ProjectStatusService,
    ProjectStatusRepository,
    ProjectUserRoleService,
    ProjectUserRoleRepository,
  ],
})
export class ProjectsModule {}
