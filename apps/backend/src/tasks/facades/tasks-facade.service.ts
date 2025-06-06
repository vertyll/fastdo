import { Injectable } from '@nestjs/common';
import { ITasksFacade } from '../interfaces/tasks-facade.interface';
import { TasksService } from '../tasks.service';

@Injectable()
export class TasksFacadeService implements ITasksFacade {
  constructor(private readonly tasksService: TasksService) {}

  public async removeByProjectId(projectId: number): Promise<void> {
    await this.tasksService.removeByProjectId(projectId);
  }
}
