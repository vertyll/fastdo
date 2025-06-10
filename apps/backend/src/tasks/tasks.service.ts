import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { ApiPaginatedResponse } from '../common/types/api-responses.interface';
import { CustomClsStore } from '../core/config/types/app.config.type';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetAllTasksSearchParams } from './dtos/get-all-tasks-search-params.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { Task } from './entities/task.entity';
import { ITasksService } from './interfaces/tasks-service.interface';
import { TaskRepository } from './repositories/task.repository';

@Injectable()
export class TasksService implements ITasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly cls: ClsService<CustomClsStore>,
  ) {}

  public async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const userId = this.cls.get('user').userId;
    const task = this.taskRepository.create({
      ...createTaskDto,
      user: { id: userId } as User,
    });

    if (createTaskDto.projectId) {
      task.project = { id: createTaskDto.projectId } as Project;
    } else {
      task.isPrivate = true;
    }

    return this.taskRepository.save(task);
  }

  public async findAll(params: GetAllTasksSearchParams): Promise<ApiPaginatedResponse<Task>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;
    const userId = this.cls.get('user').userId;

    const [items, total] = await this.taskRepository.findAllWithParams(params, skip, pageSize, userId);

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  public async findAllByProjectId(
    projectId: number,
    params: GetAllTasksSearchParams,
  ): Promise<ApiPaginatedResponse<Task>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;

    const [items, total] = await this.taskRepository.findAllWithParams(params, skip, pageSize, null, projectId);

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  public findOne(id: number): Promise<Task> {
    return this.taskRepository.findOneOrFail({
      where: { id },
      relations: ['project'],
    });
  }

  public async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.taskRepository.update(id, {
      ...updateTaskDto,
      dateModification: new Date(),
    });
    return this.findOne(id);
  }

  public async remove(id: number): Promise<void> {
    await this.taskRepository.delete(id);
  }

  public async removeByProjectId(projectId: number): Promise<void> {
    await this.taskRepository.delete({ project: { id: projectId } });
  }
}
