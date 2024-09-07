import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/projects/entities/project.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetAllTasksSearchParams } from './dto/get-all-tasks-search-params.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskQueryBuilder } from './utils/task-query.builder';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
    private queryBuilder: TaskQueryBuilder,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto);
    if (createTaskDto.projectId) {
      task.project = { id: createTaskDto.projectId } as Project;
    }
    return this.tasksRepository.save(task);
  }

  async findAll(params: GetAllTasksSearchParams): Promise<Task[]> {
    const query = this.queryBuilder.buildQuery(this.tasksRepository, params);
    return query.getMany();
  }

  async findAllByProjectId(
    projectId: number,
    params: GetAllTasksSearchParams,
  ): Promise<Task[]> {
    const query = this.queryBuilder.buildQuery(
      this.tasksRepository,
      params,
      projectId,
    );
    return query.getMany();
  }

  findOne(id: number): Promise<Task> {
    return this.tasksRepository.findOneOrFail({ where: { id } });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.tasksRepository.update(id, {
      ...updateTaskDto,
      updatedAt: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.tasksRepository.delete(id);
  }

  async removeByProjectId(projectId: number): Promise<void> {
    await this.tasksRepository.delete({ project: { id: projectId } });
  }
}
