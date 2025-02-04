import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from '../tasks/tasks.module';
import { ProjectUser } from './entities/project-user.entity';
import { Project } from './entities/project.entity';
import { ProjectManagementService } from './projects-managment.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectUserRepository } from './repositories/project-user.repository';
import { ProjectRepository } from './repositories/project.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectUser]), TasksModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectManagementService, ProjectRepository, ProjectUserRepository],
})
export class ProjectsModule {}
