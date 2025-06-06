import { Injectable } from '@nestjs/common';
import { TasksFacadeService } from '../tasks/facades/tasks-facade.service';
import { ProjectsService } from './projects.service';

@Injectable()
export class ProjectManagementService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksFacadeService,
  ) {}

  public async removeProjectWithTasks(id: number): Promise<void> {
    await this.tasksService.removeByProjectId(id);
    await this.projectsService.remove(id);
  }
}
