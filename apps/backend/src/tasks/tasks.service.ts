import { Injectable } from '@nestjs/common';
import { ApiPaginatedResponse } from '../common/interfaces/api-responses.interface';
import { Project } from '../projects/entities/project.entity';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetAllTasksSearchParams } from './dtos/get-all-tasks-search-params.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskRepository } from './repositories/task.repository';

@Injectable()
export class TasksService {
  constructor(private readonly taskRepository: TaskRepository) {}

  public async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    if (createTaskDto.projectId) {
      task.project = { id: createTaskDto.projectId } as Project;
    }
    return this.taskRepository.save(task);
  }

  public async findAll(params: GetAllTasksSearchParams): Promise<ApiPaginatedResponse<Task>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;

    const [items, total] = await this.taskRepository.findAllWithParams(params, skip, pageSize);

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

    const [items, total] = await this.taskRepository.findAllWithParams(params, skip, pageSize, projectId);

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
