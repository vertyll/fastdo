import { Inject, Injectable } from '@nestjs/common';
import { ITasksService } from '../../tasks/interfaces/tasks-service.interface';
import { ITasksServiceToken } from '../../tasks/tokens/tasks-service.token';
import { ProjectsService } from './projects.service';

@Injectable()
export class ProjectManagementService {
  constructor(
    private readonly projectsService: ProjectsService,
    @Inject(ITasksServiceToken) private readonly tasksService: ITasksService,
  ) {}

  public async removeProjectWithTasks(id: number): Promise<void> {
    await this.tasksService.removeByProjectId(id);
    await this.projectsService.remove(id);
  }
}
