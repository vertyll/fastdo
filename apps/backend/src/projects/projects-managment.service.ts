import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { ProjectsService } from './projects.service';

@Injectable()
export class ProjectManagementService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  public async removeProjectWithTasks(id: number): Promise<void> {
    await this.tasksService.removeByProjectId(id);
    await this.projectsService.remove(id);
  }
}
