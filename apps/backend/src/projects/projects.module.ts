import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageModule } from '../core/language/language.module';
import { TasksModule } from '../tasks/tasks.module';
import { Project } from './entities/project.entity';
import { ProjectManagementService } from './projects-managment.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectRepository } from './repositories/project.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), TasksModule, LanguageModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectManagementService, ProjectRepository],
})
export class ProjectsModule {}
